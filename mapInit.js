import MapFactory from './mapFactory.js'
//убрать
import {stringXML} from "./getXMLString.js";
//убрать
import {parseXML, parseXML_v2} from "./parserXML.js";

import {DrawingIntersections} from "./intersectionDrawHandler.js";

import {Parser} from "./Parser/Parser.js";

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

objectMap.map.setView([57.9657406, 56.2447505], 19)

const mapDataXML = getRequest('http://localhost:3000/MapData')
const spatXML = getRequest('http://localhost:3000/Spat')

console.log(Parser.getMapDataObject(mapDataXML))
console.log(Parser.getSpatObject(spatXML))

// const arrayOfIntersectionsData = parseXML_v2(stringXML)
// console.log(arrayOfIntersectionsData)

// const drawingIntersection = new DrawingIntersections(arrayOfIntersectionsData, objectMap.map)
// drawingIntersection.drawIntersections()

//intersectionDrawHandler(arrayOfIntersectionsData, objectMap.map)