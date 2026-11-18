require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => {
    res.send('¡Hola! El servidor de TRIVIA LEARN está funcionando. 🚀');
});

// NUEVA RUTA PRINCIPAL: Generador de Trivia
app.get('/api/generar-trivia', async (req, res) => {
    try {
        // 1. Capturar las variables de la URL (si no envían, usamos valores por defecto)
        const tema = req.query.tema || 'Cultura General';
        const dificultad = req.query.dificultad || 'medio';

        // 2. Crear el Prompt maestro estructurado
        const prompt = `
        Eres el motor backend de una aplicación de trivias. 
        Genera exactamente 10 preguntas de opción múltiple sobre el tema "${tema}" con un nivel de dificultad "${dificultad}".
        Devuelve el resultado ESTRICTAMENTE como un arreglo JSON. 
        Estructura requerida para cada pregunta:
        {
          "pregunta": "Texto de la pregunta",
          "opciones": ["Opción 1", "Opción 2", "Opción 3", "Opción 4"],
          "respuesta_correcta": "Texto exacto de la opción correcta"
        }
        `;

        // 3. Configurar el modelo forzando salida JSON
        const model = ai.getGenerativeModel({ 
            model: "gemini-3.8-flash", 
            generationConfig: { responseMimeType: "application/json" }
        });
        
        // 4. Solicitar el contenido a la IA
        const result = await model.generateContent(prompt);
        const textoRespuesta = result.response.text();
        
        // 5. Convertir el texto de la IA a un objeto real de programación
        const triviaJSON = JSON.parse(textoRespuesta);

        // 6. Enviar el paquete completo a quien lo haya solicitado
        res.json({ 
            exito: true, 
            tema: tema, 
            dificultad: dificultad, 
            cantidad: triviaJSON.length,
            datos: triviaJSON 
        });
        
    } catch (error) {
        console.error("Error al generar la trivia:", error);
        res.status(500).json({ exito: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(`🚀 Servidor listo en http://localhost:${port}`);
});