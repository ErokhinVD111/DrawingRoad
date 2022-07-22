import {getDeltaLatLon} from "./calculateDistance.js"
//import { curve } from "/leaflet.curve.js";

class DrawingIntersections {
    constructor(arrayOfIntersections, map) {
        this.arrayOfIntersections = arrayOfIntersections
        this.map = map
        this.drawnLanes = []
    }
    drawIntersectionIcon(refPoint) {
        this.intersectionIcon = L.circle([refPoint.lat, refPoint.lon], {
            color: "red",
            fillColor: "#f03",
            fillOpacity: 0.5,
            radius: 70
        })
    }
    drawIntersection() {
        this.arrayOfIntersections.forEach(intersection => {
            this.drawIntersectionIcon(intersection.refPoint)
            this.intersectionIcon.on('click', (e) => {
                intersection.lanesData.forEach(laneData => {
                    this.drawLane(laneData)
                })
            })
        })
    }
    drawLane(laneData) {

        //Получение координат для границ полосы
        function getCoordsBoundLane(typeBound, deltaLan, deltaLon) {
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

        //Получение координат для средней линии у полосы
        function getCoordsMiddleLine() {
            const coordsOfMiddleLine = []
            for (let i = 0; i < laneData.lat.length; i++) {
                coordsOfMiddleLine.push([laneData.lat[i], laneData.lon[i]])
            }
            //Меняем направление в зависимости от атрибута 'directionalUse'
            if (laneData.directionalUse === '10') {
                coordsOfMiddleLine.reverse()
            }
            return coordsOfMiddleLine
        }

        //Получение смещений по широте и долготе для гранниц полосы
        function getDeltaLatLon() {
            let deltaLat, deltaLon
            //Если больше изменяется долгота, то границы будут более вертикальными
            if (Math.abs(laneData.lat[0] - laneData.lat[laneData.lat.length - 1]) < Math.abs(laneData.lon[0] - laneData.lon[laneData.lon.length - 1])) {
                deltaLat = getDeltaLatLon(laneData.lat[0], laneData.lon[0], (intersection.laneWidth) / 2).lat
                deltaLon = 0
            }
            //Если больше изменяется широта, то границы будут более горизонтальными
            else {
                deltaLat = 0
                deltaLon = getDeltaLatLon(laneData.lat[0], laneData.lon[0], (intersection.laneWidth) / 2).lon
            }
            return {deltaLat, deltaLon}
        }

        //Отрисовка средней линии у полосы
        function drawMiddleLine(coordsOfMiddleLine) {
            const middleLine = L.polyline(coordsOfMiddleLine, {weight: 1}).addTo(this.map)
            const middleLineDecorator = L.polylineDecorator(middleLine, {
                patterns: [
                    {
                        offset: '20%',
                        repeat: 70,
                        symbol: L.Symbol.arrowHead({pixelSize: 10, polygon: false, pathOptions: {stroke: true}})
                    }
                ]
            }).addTo(this.map);
            return {middleLine, middleLineDecorator}
        }

        //Отрисовка границ для полосы
        function drawBounds(coordsOfFirstBound, coordsOfSecondBound) {
            const bounds = L.polygon([...coordsOfFirstBound, ...coordsOfSecondBound.reverse()], {
                color: 'black',
                weight: 1,
                fillColor: 'black'
            }).addTo(this.map)
            return bounds
        }

        //Отрисовка стоп линии
        function drawStopLine(coordsMiddleLane, deltaLat, deltaLon) {
            let stopLine = null

            if (laneData['directionalUse'] === '10') {
                stopLine = L.polyline([[coordsMiddleLane[coordsMiddleLane.length-1][0] + deltaLat, coordsMiddleLane[coordsMiddleLane.length-1][1] + deltaLon],
                    [coordsMiddleLane[coordsMiddleLane.length-1][0] - deltaLat, coordsMiddleLane[coordsMiddleLane.length-1][1] - deltaLon]], {
                    weight: 8,
                    color: '#03fce8'
                }).addTo(this.map)
            }
            return stopLine
        }

        const coordsOfMiddleLine = getCoordsMiddleLine()
        const delta = getDeltaLatLon()
        const coordsOfFirstBound = getCoordsBoundLane('UP', delta.deltaLat, delta.deltaLon)
        const coordsOfSecondBound = getCoordsBoundLane('DOWN', delta.deltaLat, delta.deltaLon)
        const middleLine = drawMiddleLine(coordsOfMiddleLine)
        const bounds = drawBounds(coordsOfFirstBound, coordsOfSecondBound)
        const stopLine = drawStopLine(coordsMiddleLane, delta.deltaLat, delta.deltaLon)







        let deltaLat, deltaLon
        if (Math.abs(laneData.lat[0] - laneData.lat[laneData.lat.length - 1]) < Math.abs(laneData.lon[0] - laneData.lon[laneData.lon.length - 1])) {
            deltaLat = getDeltaLatLon(laneData.lat[0], laneData.lon[0], (intersection.laneWidth) / 2).lat
            deltaLon = 0
        } else {
            deltaLat = 0
            deltaLon = getDeltaLatLon(laneData.lat[0], laneData.lon[0], (intersection.laneWidth) / 2).lon
        }

        const coordsOfUpBoundLane = getCoordsBoundLane(laneData, 'UP', deltaLat, deltaLon)
        const coordsOfBottomBoundLane = getCoordsBoundLane(laneData, 'DOWN', deltaLat, deltaLon)
        const coordsMiddleLane = getCoordsMiddleLine(laneData)

        const middleLane = L.polyline(coordsMiddleLane, {weight: 1}).addTo(map)

        let stopLine = null

        if (laneData['directionalUse'] === '10') {
            stopLine = L.polyline([[coordsMiddleLane[coordsMiddleLane.length-1][0] + deltaLat, coordsMiddleLane[coordsMiddleLane.length-1][1] + deltaLon],
                [coordsMiddleLane[coordsMiddleLane.length-1][0] - deltaLat, coordsMiddleLane[coordsMiddleLane.length-1][1] - deltaLon]], {
                weight: 8,
                color: '#03fce8'
            }).addTo(this.map)
        }

        const multiPolyline = L.polygon([...coordsOfUpBoundLane, ...coordsOfBottomBoundLane.reverse()], {
            color: 'black',
            weight: 1,
            fillColor: 'black'
        }).addTo(this.map)

        const middleLaneDecorator = L.polylineDecorator(middleLane, {
            patterns: [
                {
                    offset: '20%',
                    repeat: 70,
                    symbol: L.Symbol.arrowHead({pixelSize: 10, polygon: false, pathOptions: {stroke: true}})
                }
            ]
        }).addTo(map);

        this.drawnLanes.push({
            'stopLine': stopLine,
            'delta': {deltaLat, deltaLon},
            'connectingLanes': laneData.connectingLanes,
            'laneID': laneData.laneID,
            'middleLane': middleLane,
            'bounds': multiPolyline,
            'middleLaneDecorator': middleLaneDecorator
        })
    }
    drawExitPath(firstLane, secondLane) {}
}



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
        drawnLanes.forEach(drawnLane => {
            drawnLanes.forEach(anotherDrawnLane => {
                // console.log(drawnLane.connectingLanes)
                if (typeof drawnLane.connectingLanes !== 'undefined') {
                    drawnLane.bounds.on('click', (e) => {
                        drawnLane.connectingLanes.forEach(connectingLane => {
                            if (connectingLane === anotherDrawnLane.laneID) {
                                joinLanes(drawnLane, anotherDrawnLane, map)
                            }
                        })
                    })
                }
            })
        })
    })
    intersectionIcon.addTo(map)
}


function joinLanes(firstLane, secondLane, map) {
    //const middleLane = L.polyline([...firstLane.middleLane.getLatLngs().slice(-1), ...secondLane.middleLane.getLatLngs().slice(0)], {weight: 1}).addTo(map)
    //secondLane.middleLane.remove()
    //firstLane.middleLaneDecorator.remove()
    // console.log(firstLane.middleLane.getLatLngs().slice(-1)[0]['lng'])
    const fLane = {lat: firstLane.middleLane.getLatLngs().slice(-1)[0]['lat'], lon:firstLane.middleLane.getLatLngs().slice(-1)[0]['lng']}
    // console.log(fLane)
    const sLane = {lat: secondLane.middleLane.getLatLngs().slice(0)[0]['lat'], lon:secondLane.middleLane.getLatLngs().slice(0)[0]['lng']}
    //middleLane.remove()
    const midLane = L.curve(["M", [fLane.lat, fLane.lon], "Q", [57.965896, 56.244605], [sLane.lat, sLane.lon]], {
        color: 'black',
        weight: 1
    }).addTo(map);


    //secondLane.middleLaneDecorator.remove()
    // const multiPolyline = L.polygon([...coordsOfUpBoundLane, ...coordsOfBottomBoundLane.reverse()], {
    //     color: 'black',
    //     weight: 1,
    //     fillColor: 'yellow'
    // }).addTo(map)
    //

    const middleLaneDecorator = L.polylineDecorator(midLane, {
        patterns: [
            {
                offset: '100%',
                repeat: 10,
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
            deltaLat = getDeltaLatLon(laneData.lat[0], laneData.lon[0], (intersection.laneWidth) / 2).lat
            deltaLon = 0
        } else {
            deltaLat = 0
            deltaLon = getDeltaLatLon(laneData.lat[0], laneData.lon[0], (intersection.laneWidth) / 2).lon
        }

        const coordsOfUpBoundLane = getCoordsBoundLane(laneData, 'UP', deltaLat, deltaLon)
        const coordsOfBottomBoundLane = getCoordsBoundLane(laneData, 'DOWN', deltaLat, deltaLon)
        const coordsMiddleLane = getCoordsMiddleLane(laneData)

        const middleLane = L.polyline(coordsMiddleLane, {weight: 1}).addTo(map)

        let stopLine = null

        if (laneData['directionalUse'] === '10') {
            stopLine = L.polyline([[coordsMiddleLane[coordsMiddleLane.length-1][0] + deltaLat, coordsMiddleLane[coordsMiddleLane.length-1][1] + deltaLon],
                [coordsMiddleLane[coordsMiddleLane.length-1][0] - deltaLat, coordsMiddleLane[coordsMiddleLane.length-1][1] - deltaLon]], {
                weight: 8,
                color: '#03fce8'
            }).addTo(map)
        }

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
            'stopLine': stopLine,
            'delta': {deltaLat, deltaLon},
            'connectingLanes': laneData.connectingLanes,
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



