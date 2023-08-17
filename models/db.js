const mongoose = require('mongoose');
require("dotenv").config();

// Definir el esquema
const { Schema } = mongoose;

const mensajeSchema = new Schema({
  sensors: {
    ph: Number,
    tds: Number,
    distance: Number,
    dht11: {
      temperature: Number,
      humidity: Number,
    },
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
}, { versionKey: false });

// Definir el modelo
const Mensaje = mongoose.model('esp32sensors', mensajeSchema);


// Función para mostrar los registros
async function mostrar() {
  try {
    const registros = await Mensaje.find();
    console.log('Registros:', registros);
  } catch (error) {
    console.error('Error al mostrar los registros:', error);
  }
}

  // Función para crear y guardar un nuevo registro
async function crear(datos) {
  try {
    const nuevoRegistro = new Mensaje(datos);
    const resultado = await nuevoRegistro.save();
    console.log('Registro creado:', resultado);
  } catch (error) {
    console.error('Error al crear el registro:', error);
  }
}

// Ejemplo de uso de la función crear
const datosEjemplo = {
  sensors: {
    ph:  4.5,
    tds: 400 ,
    distance: 165,
    dht11: { temperature: 20.20000076, humidity: 75 }
  }
};

// crear(datosEjemplo);
// mostrar();

const Sensors = mongoose.model('esp32sensors', mensajeSchema);
module.exports = Sensors;