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
        const drawnLanes = drawLanes(intersection, map)
        // drawnLanes.forEach(drawnLane => {
        //     console.log(drawnLane)
        //     drawnLanes.forEach(anotherDrawnLane => {
        //         if (typeof drawnLane.connectingLanes !== 'undefined') {
        //             drawnLane.connectingLanes.forEach(connectingLane => {
        //                 if (connectingLane === anotherDrawnLane.laneID) {
        //                     joinLanes(drawnLane, anotherDrawnLane, map)
        //                 }
        //             })
        //         }
        //     })
        // })
    })
    intersectionIcon.addTo(map)
}


function joinLanes(firstLane, secondLane, map) {
    const middleLane = L.polyline([...firstLane.middleLane.getLatLngs().slice(-1), ...secondLane.middleLane.getLatLngs().slice(0)], {weight: 1}).addTo(map)
    //secondLane.middleLane.remove()
    //firstLane.middleLaneDecorator.remove()
    secondLane.middleLaneDecorator.remove()
    // const multiPolyline = L.polygon([...coordsOfUpBoundLane, ...coordsOfBottomBoundLane.reverse()], {
    //     color: 'black',
    //     weight: 1,
    //     fillColor: 'yellow'
    // }).addTo(map)
    //
    const middleLaneDecorator = L.polylineDecorator(middleLane, {
        patterns: [
            {
                offset: '20%',
                repeat: 80,
                symbol: L.Symbol.arrowHead({pixelSize: 10, polygon: false, pathOptions: {stroke: true}})
            }
        ]
    }).addTo(map)

    // console.log(...firstLane.bounds.getLatLngs())
    // console.log(secondLane.bounds.getLatLngs())
    // console.log([].concat(...firstLane.bounds.getLatLngs(), ...secondLane.bounds.getLatLngs()))
    // const multiPolyline = L.polygon([].concat(...firstLane.bounds.getLatLngs(), ...secondLane.bounds.getLatLngs()), {
    //     color: 'black',
    //     weight: 1,
    //     fillColor: 'yellow'
    // }).addTo(map)

    //firstLane.bounds.

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

    const drawnLanes = []

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
            color: 'black',
            weight: 1,
            fillColor: 'black'
        }).addTo(map)

        const middleLaneDecorator = L.polylineDecorator(middleLane, {
            patterns: [
                {
                    offset: '20%',
                    repeat: 70,
                    symbol: L.Symbol.arrowHead({pixelSize: 10, polygon: false, pathOptions: {stroke: true}})
                }
            ]
        }).addTo(map);

        drawnLanes.push({
            'connectingLanes': laneData.connectingLane,
            'laneID': laneData.laneID,
            'middleLane': middleLane,
            'bounds': multiPolyline,
            'middleLaneDecorator': middleLaneDecorator
        })
    })
    return drawnLanes
}


export {
    intersectionDrawHandler
}



