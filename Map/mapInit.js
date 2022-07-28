import MapFactory from './mapFactory.js'
import {DrawingIntersections} from "../IntersectionsHandler/DrawingIntersections.js";

import {Parser} from "../Parser/Parser.js";

function getRequest(url) {
    const sender = new XMLHttpRequest()
    sender.open("GET", url, false)
    sender.send()
    return sender.response
}

const objectMap = MapFactory.getMap('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: '© OpenStreetMap',
    opacity: 1
})

//Получаем XML файлы от сервера
const mapDataXML = getRequest('http://localhost:3000/MapData')
const spatXML = getRequest('http://localhost:3000/Spat')

//Парсим XML файлы в объекты
const mapDataObject = Parser.getMapDataObject(mapDataXML)
const spatObject = Parser.getSpatObject(spatXML)

//Устанавливаем координаты
objectMap.map.setView([mapDataObject[0].refPoint.lat, mapDataObject[0].refPoint.lon], 18)

console.log(mapDataObject)
console.log(spatObject)

//Создаем объект для работы с перекреском
const drawingIntersections = new DrawingIntersections(mapDataObject, spatObject, objectMap.map)
drawingIntersections.drawIntersections()

