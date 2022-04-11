require('dotenv').config();
const { 
    inquirerMenu, 
    pausa, 
    leerInput,
    listarLugares
} = require('./helpers/inquirer');
const Busquedas = require('./models/busquedas');

const main = async () => {
    let opt = '';
    const busquedas = new Busquedas();

    do {
        console.clear();
        opt = await inquirerMenu();
        
        switch(opt) {
            case 1:
                //Mostrar mensaje
                const lugar = await leerInput('Ciudad: ');
                //Buscar lugares
                const lugares = await busquedas.ciudad(lugar)
                //Seleccionar el lugar
                const id = await listarLugares(lugares);
                if(id === '0') continue

                const lugarSeleccionado = lugares.find(lugar => lugar.id === id);
                busquedas.agregarHistorial(lugarSeleccionado.nombre);
                //Datos del clima
                const clima = await busquedas.climaLugar(lugarSeleccionado.lat,lugarSeleccionado.lng);
                //Mostrando info
                console.clear();
                console.log('\n*****Información de la ciuidad*****\n'.green);
                console.log(`Nombre: ${lugarSeleccionado.nombre}`);
                console.log(`Latitud: ${lugarSeleccionado.lat}`);
                console.log(`Longitud: ${lugarSeleccionado.lng}\n`);
                console.log('\n*****Información del clima*****\n'.green);
                console.log(`Información: ${clima.desc}`);
                console.log(`Temperatura: ${clima.temp}`);
                console.log(`Máxima: ${clima.max}`);
                console.log(`Mínima: ${clima.min}\n`);
            break;

            case 2:
                busquedas.historialCapitalizado.forEach((lugar,i) => {
                    const idx = `${ i + 1}.`.green;
                    console.log( `${ idx } ${lugar}.`)
                })
            break;
        }
        if(opt!==0) await pausa();
    } while (opt !== 0);
}

main();