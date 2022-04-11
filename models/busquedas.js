const fs = require('fs');
const axios = require("axios");

class Busquedas {
    historial = [];
    dbPath = './db/database.json'

    constructor (){
        // TODO: leer DB si existe
    }

    get paramsMapBox(){
        return {
            types:'place',
            access_token: process.env.MAPBOX_KEY,
            limit: 5,
            lenguage: 'es' 
        }
    }

    get paramsOpenWeather(){
        return {
            appid:process.env.OPENWEATHER_KEY,
            units: 'metric',
            lang: 'es'
        }
    }

    get historialCapitalizado () {
        return this.historial.map((lugar) => {
            let palabras = lugar.split(' ');
            palabras = palabras.map(p => p[0].toUpperCase() + p.substring(1));
            return palabras.join(' ');
        })
    }

    async ciudad (lugar = ''){
        //Petición http
        const instance = axios.create({
            baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
            params: this.paramsMapBox
        });
        try {
            const resp = await instance.get();
            return resp.data.features.map(lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]
            }));
        } catch (error) {
            return [];
        }

    }

    async climaLugar (lat , lon){
        try {
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: {...this.paramsOpenWeather, lat, lon}
            })
            const {data} = await instance.get();
            const {weather, main} = data;
            
            return {
                desc: weather[0].description,
                temp: main.temp,
                min: main.temp_min,
                max: main.temp_max
            }
            
        } catch (error) {
            console.log(error)
        }
    }

    async agregarHistorial (lugar = ''){

        if(this.historial.includes(lugar.toLowerCase())) return

        //TODO: prevenir duplicados
        this.historial.unshift(lugar.toLowerCase());

        this.historial = this.historial.unshift(0,5);

        //grabar en DB
        this.guardarDB();
    }

    guardarDB ( ) {
        const payload = {
            historial: this.historial
        }

        fs.writeFileSync(this.dbPath, JSON.stringify(payload));
    }

    leerDB ( ) {
        if(!fs.existsSync(this.dbPath)) return 

        const info = fs.readFileSync(this.dbPath, {encoding:'utf-8'});
        const data = JSON.parse(info);

        this.historial = data.historial;
    }
}

module.exports = Busquedas;