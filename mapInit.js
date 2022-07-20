import MapFactory from './mapFactory.js'
import {stringXML} from "./getXMLString.js";
import {parseXML} from "./parserXML.js";
import {intersectionDrawHandler} from "./intersectionDrawHandler.js";

const objectMap = MapFactory.getMap('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: '© OpenStreetMap',
    opacity: 0.4
})


//Сделать перекрестки отдельными объектами (т.к. их может быть много)
//у каждого объекта будут храниться все дороги
//создать отдельный класс для отрисовки перекрестка
objectMap.map.setView([57.9657406, 56.2447505], 17)

const arrayOfIntersectionsData = parseXML(stringXML)
console.log(arrayOfIntersectionsData)

intersectionDrawHandler(arrayOfIntersectionsData, objectMap.map)











// intersectionIcon.on('click', (e) => {
//     lanesData.forEach(laneData => {
//         const latlngs = []
//         for (let i = 0; i < laneData.lat.length; i++) {
//             latlngs.push([laneData.lat[i], laneData.lon[i]])
//         }
//         if (laneData.directionalUse === '10') {
//             latlngs.reverse()
//         }
//         const polyline = L.polyline(latlngs, {
//             color: 'red',
//             weight: 1
//         }).addTo(objectMap.map)
//         polyline.on('click', (e) => {
//             polyline.remove()
//             decorator.remove()
//         })
//
//         const decorator = L.polylineDecorator(polyline, {
//             patterns: [
//                 // defines a pattern of 10px-wide dashes, repeated every 20px on the line
//                 {offset: 0, repeat: 70, symbol: L.Symbol.arrowHead({pixelSize: 10, polygon: false, pathOptions: {stroke: true}})}
//             ]
//         }).addTo(objectMap.map);
//     })
//     intersectionIcon.remove()
// })
// intersectionIcon.addTo(objectMap.map)


//L.marker([57.9657406, 56.2447505]).addTo(objectMap.map).bindPopup("<p>Перекресток</p>")

function getIntersectionIcon(coords) {
    return L.circle(coords, {
        color: "red",
        fillColor: "#f03",
        fillOpacity: 0.5,
        radius: 70
    })
}



