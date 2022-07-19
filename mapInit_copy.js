import MapFactory from './mapFactory.js'
import {stringXML} from "./getXMLString.js";

const objectMap = MapFactory.getMap('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: '© OpenStreetMap',
    opacity: 0.6
})

const parser = new DOMParser()

const xmlDoc = parser.parseFromString(stringXML, "text/xml")
const childs = xmlDoc.getElementsByTagName("laneSet")[0].childNodes
const lanesData = []

childs.forEach((genericLane) => {
    const laneData = {}
    if (genericLane.nodeName === 'GenericLane') {
        genericLane.childNodes.forEach((childNode) => {

            if (childNode.nodeName === 'laneID') {
                //console.log('laneID:' + childNode.textContent)
                laneData["laneID"] = childNode.textContent
            }

            if (childNode.nodeName === 'ingressApproach') {
                //console.log('ingressApproach:' + childNode.textContent)
                laneData["ingressApproach"] = childNode.textContent
            }

            if (childNode.nodeName === 'laneAttributes') {
                //console.log('laneAttributes:' + childNode.childNodes[1].textContent)
                laneData['directionalUse'] = childNode.childNodes[1].textContent
            }
            if (childNode.nodeName === 'nodeList') {
                const arrayLat = []
                const arrayLon = []
                childNode
                    .childNodes[1].childNodes.forEach((nodeXY) => {
                        if (nodeXY.nodeName === 'NodeXY') {
                            nodeXY.childNodes.forEach(delta => {
                                if (delta.nodeName === 'delta') {
                                    delta.childNodes.forEach(nodeLatLon => {
                                        if (nodeLatLon.nodeName === 'node-LatLon') {
                                            nodeLatLon.childNodes.forEach((latlng) => {
                                                if (latlng.nodeName === 'lat') {
                                                    const lat = latlng.textContent
                                                    arrayLat.push(lat.slice(0, 2) + "." + lat.slice(2))
                                                    //arrayLat.push(latlng.textContent)
                                                }
                                                else if (latlng.nodeName === 'lon') {
                                                    const lon = latlng.textContent
                                                    arrayLon.push(lon.slice(0, 2) + "." + lon.slice(2))
                                                    //arrayLon.push(latlng.textContent)
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })
                laneData['lat'] = arrayLat
                laneData['lon'] = arrayLon
                // console.log("Array lat:")
                // console.table(arrayLat)
                // console.log("Array lon:")
                // console.table(arrayLon)
            }
            if (childNode.nodeName === 'connectsTo') {
                const connectingLane = []
                const signalGroup = []
                const connectionID = []
                childNode.childNodes.forEach(connection => {
                    if (connection.nodeName === 'Connection') {
                        connection.childNodes.forEach(element => {
                            if (element.nodeName === 'connectingLane') {
                                connectingLane.push(element.childNodes[1].textContent)
                            }
                            if (element.nodeName === 'signalGroup') {
                                signalGroup.push(element.textContent)
                            }
                            if (element.nodeName === 'connectionID') {
                                connectionID.push(element.textContent)
                            }
                        })
                    }
                })
                laneData['connectingLane'] = connectingLane
                laneData['signalGroup'] = signalGroup
                laneData['connectionID'] = connectionID
            }
        })
    }
    if (Object.keys(laneData).length !== 0)
        lanesData.push(laneData)
})
console.log(lanesData)

lanesData.forEach(laneData => {
    const latlngs = []
    for (let i = 0; i < laneData.lat.length; i++) {
        latlngs.push([laneData.lat[i], laneData.lon[i]])
    }
    if (laneData.directionalUse === '10') {
        latlngs.reverse()
    }
    const polyline = L.polyline(latlngs, {
        weight: 2,
    }).addTo(objectMap.map)
    const decorator = L.polylineDecorator(polyline, {
        patterns: [
            // defines a pattern of 10px-wide dashes, repeated every 20px on the line
            {offset: 0, repeat: 70, symbol: L.Symbol.arrowHead({pixelSize: 10, polygon: false, pathOptions: {stroke: true}})}
        ]
    }).addTo(objectMap.map);
})




// xmlDoc.getElementsByTagName("refPoint")[0].childNodes.forEach(elem => {
//     if (elem.nodeName === 'lat') {
//         console.log(`lat: ${elem.textContent}`)
//     }
//     else if (elem.nodeName === 'long') {
//         console.log(`long: ${elem.textContent}`)
//     }
// })

//objectMap.map.setView([58.006323, 56.286684], 17)
objectMap.map.setView([57.9657406, 56.2447505], 17)
L.marker([57.9657406, 56.2447505]).addTo(objectMap.map).bindPopup("<p>Перекресток</p>")



