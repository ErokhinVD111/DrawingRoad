import {getDeltaLatLon} from "./calculateDistance.js";

function getIntersectionIcon(coords) {
    return L.circle(coords, {
        color: "red",
        fillColor: "#f03",
        fillOpacity: 0.5,
        radius: 70
    })
}

function intersectionDrawHandler(arrayOfIntersectionsData, map) {
    arrayOfIntersectionsData.forEach(intersection => {
        drawIntersection(intersection, map)
    })
}

function drawIntersection(intersection, map) {
    const intersectionIcon = getIntersectionIcon([intersection.refPoint.lat, intersection.refPoint.lon])
    intersectionIcon.on('click', (e) => {
        intersectionIcon.remove()
        drawLanes(intersection, map)
    })
    intersectionIcon.addTo(map)
}


function drawLanes(intersection, map) {

    //Получение координат для границ (верхней и нижней)
    function getCoordsBoundLane(laneData, typeBound, deltaLan, deltaLon) {
        const coordsBoundLane = []
        for (let i = 0; i < laneData.lon.length; i++) {
            if (typeBound === 'UP') {
                coordsBoundLane.push([laneData.lat[i] + deltaLan, laneData.lon[i] + deltaLon])
            } else {
                coordsBoundLane.push([laneData.lat[i] - deltaLan, laneData.lon[i] - deltaLon])
            }
        }
        return coordsBoundLane
    }

    //Получение координат для средней линии
    function getCoordsMiddleLane(laneData) {
        const arrayOfCoords = []
        for (let i = 0; i < laneData.lat.length; i++) {
            arrayOfCoords.push([laneData.lat[i], laneData.lon[i]])
        }
        if (laneData.directionalUse === '10') {
            arrayOfCoords.reverse()
        }
        return arrayOfCoords
    }


    intersection.lanesData.forEach(laneData => {

        let deltaLat, deltaLon
        if (Math.abs(laneData.lat[0] - laneData.lat[laneData.lat.length - 1]) < Math.abs(laneData.lon[0] - laneData.lon[laneData.lon.length - 1])) {
            deltaLat = getDeltaLatLon(laneData.lat[0], laneData.lon[0], (intersection.laneWidth / 100) / 2).lat
            deltaLon = 0
        } else {
            deltaLat = 0
            deltaLon = getDeltaLatLon(laneData.lat[0], laneData.lon[0], (intersection.laneWidth / 100) / 2).lon
        }

        const coordsOfUpBoundLane = getCoordsBoundLane(laneData, 'UP', deltaLat, deltaLon)
        const coordsOfBottomBoundLane = getCoordsBoundLane(laneData, 'DOWN', deltaLat, deltaLon)
        const coordsMiddleLane = getCoordsMiddleLane(laneData)

        const middleLane = L.polyline(coordsMiddleLane, {weight: 1}).addTo(map)

        const multiPolyline = L.polygon([...coordsOfUpBoundLane, ...coordsOfBottomBoundLane.reverse()], {
            color: 'red',
            weight: 1
        }).addTo(map)

        L.polylineDecorator(middleLane, {
            patterns: [
                {
                    offset: '20%',
                    repeat: 70,
                    symbol: L.Symbol.arrowHead({pixelSize: 10, polygon: false, pathOptions: {stroke: true}})
                }
            ]
        }).addTo(map);
    })
}




//
//
//
//
//
//
//
//
//
//
//
//     intersection.lanesData.forEach(laneData => {
//         let index = -1
//         const arrayLatLngUp = []
//         const arrayLatLngDown = []
//         for (let i = 0; i < laneData.lat.length; i++) {
//             const delta = getDeltaLatLon(laneData.lat[i], laneData.lon[i])
//             arrayLatLngUp.push([Number(laneData.lat[i]) + index * Number(delta.lat), laneData.lon[i]])
//         }
//         for (let i = 0; i < laneData.lat.length; i++) {
//             const delta = getDeltaLatLon(laneData.lat[i], laneData.lon[i])
//             arrayLatLngDown.push([Number(laneData.lat[i]) - index * Number(delta.lat), laneData.lon[i]])
//         }
//         const latlngsMultiPolyline = [...arrayLatLngUp, ...arrayLatLngDown.reverse()]
//         const latlngs = []
//         for (let i = 0; i < laneData.lat.length; i++) {
//             latlngs.push([laneData.lat[i], laneData.lon[i]])
//         }
//         if (laneData.directionalUse === '10') {
//             latlngs.reverse()
//         }
//         const polyline = L.polyline(latlngs, {
//             weight: 1
//         }).addTo(map)
//         const multiPolyline = L.polygon(latlngsMultiPolyline, {
//             color: 'red',
//             weight: 1
//         }).addTo(map).on('click', (e) => multiPolyline.remove())
//         L.polylineDecorator(polyline, {
//             patterns: [
//                 // defines a pattern of 10px-wide dashes, repeated every 20px on the line
//                 {
//                     offset: '20%',
//                     repeat: 70,
//                     symbol: L.Symbol.arrowHead({pixelSize: 10, polygon: false, pathOptions: {stroke: true}})
//                 }
//             ]
//         }).addTo(map);
//         intersectionIcon.remove()
//     })
// }

export {
    intersectionDrawHandler
}



