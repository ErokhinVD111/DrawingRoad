import {getDeltaLatLon} from "./calculateDistance.js";

class DrawingLanes {

    constructor(lanesData, map) {
        this.lanesData = lanesData
        this.map = map
        this.drawnLanes = []
    }

    //Возвращает массив из отрисованных объектов
    getDrawnLanes() {
        return this.drawnLanes
    }

    //Метод для отрисовки полос из массива lanesData
    drawLanes() {
        this.lanesData.forEach(laneData => this.drawLane(laneData))
    }

    //Метод для создания единого объекта из нарисованных объектов и добавление их в массив
    createDrawnLanes(laneData, bounds, middleLineWithDecorator, stopLine, coordsForBounds) {
        this.drawnLanes.push({
            laneInfo: {
                sharedWith: laneData.sharedWith,
                maneuvers: laneData.maneuvers,
                laneType: laneData.laneType,
                directionalUse: laneData.directionalUse,
                laneID: laneData.laneID,
                connectingLanes: laneData.connectingLanes
            },
            coordsOfMiddleIntersection: this.getCoordsForMiddlePointOnIntersection(),
            info: '',
            connectingLanes: laneData.connectingLanes,
            middleLineWithDecorator,
            bounds,
            stopLine,
            connectedLanes: [],
            firstBound: coordsForBounds.coordsForFirstBound,
            secondBound: coordsForBounds.coordsForSecondBound
        })
    }

    //Метод для отрисовки элементов полосы
    drawLane(laneData) {

        //Получение данных для отрисовки
        const coordsForMiddleLine = this.getCoordsForMiddleLine(laneData)
        const delta = this.calculateDeltaLatLon(laneData)
        const coordsForFirstBound = this.getCoordsForBound(laneData, 'UP', delta)
        const coordsForSecondBound = this.getCoordsForBound(laneData, 'DOWN', delta)

        //Отрисовка необходимых частей
        const bounds = this.drawBounds(coordsForFirstBound, coordsForSecondBound)
        const middleLineWithDecorator = this.drawMiddleLineWithDecorator(coordsForMiddleLine)
        const stopLine = this.drawStopLine(coordsForMiddleLine, laneData, delta)

        //Добавляем в массив
        this.createDrawnLanes(laneData, bounds, middleLineWithDecorator, stopLine, {
            coordsForFirstBound,
            coordsForSecondBound
        })

    }

    //Метод для получения координат для верхней и нижней границы
    //Данные координаты используются для отрисовки ширины полосы
    getCoordsForBound(laneData, typeBound, delta) {
        const coordsBoundLane = []
        const k = (laneData.lat[0] - laneData.lat[laneData.lat.length-1]) / (laneData.lon[0] - laneData.lon[laneData.lon.length-1])
        console.log(k)
        for (let i = 0; i < laneData.lon.length; i++) {
            if (k > 0) {
                if (typeBound === 'UP') {
                    const pointOne = {lat: laneData.lat[i] + delta.lat, lon: laneData.lon[i]}
                    const pointTwo = {lat: laneData.lat[i], lon: laneData.lon[i] - delta.lon}
                    const pointMiddle = {lat: (pointOne.lat + pointTwo.lat) / 2, lon: (pointOne.lon + pointTwo.lon) / 2}
                    // coordsBoundLane.push([laneData.lat[i] + delta.lat, laneData.lon[i] + delta.lon])
                    coordsBoundLane.push([pointMiddle.lat, pointMiddle.lon])
                } else {
                    // coordsBoundLane.push([laneData.lat[i] - delta.lat, laneData.lon[i] - delta.lon])
                    const pointOne = {lat: laneData.lat[i] - delta.lat, lon: laneData.lon[i]}
                    const pointTwo = {lat: laneData.lat[i], lon: laneData.lon[i] + delta.lon}
                    const pointMiddle = {lat: (pointOne.lat + pointTwo.lat) / 2, lon: (pointOne.lon + pointTwo.lon) / 2}
                    coordsBoundLane.push([pointMiddle.lat, pointMiddle.lon])
                }
            }
            else {
                if (typeBound === 'UP') {
                    const pointOne = {lat: laneData.lat[i] - delta.lat, lon: laneData.lon[i]}
                    const pointTwo = {lat: laneData.lat[i], lon: laneData.lon[i] - delta.lon}
                    const pointMiddle = {lat: (pointOne.lat + pointTwo.lat) / 2, lon: (pointOne.lon + pointTwo.lon) / 2}
                    // coordsBoundLane.push([laneData.lat[i] + delta.lat, laneData.lon[i] + delta.lon])
                    coordsBoundLane.push([pointMiddle.lat, pointMiddle.lon])
                } else {
                    // coordsBoundLane.push([laneData.lat[i] - delta.lat, laneData.lon[i] - delta.lon])
                    const pointOne = {lat: laneData.lat[i] + delta.lat, lon: laneData.lon[i]}
                    const pointTwo = {lat: laneData.lat[i], lon: laneData.lon[i] + delta.lon}
                    const pointMiddle = {lat: (pointOne.lat + pointTwo.lat) / 2, lon: (pointOne.lon + pointTwo.lon) / 2}
                    coordsBoundLane.push([pointMiddle.lat, pointMiddle.lon])
                }
            }
        }
        return coordsBoundLane
    }

    //Метод для получения координат для средней линии
    //Данные координаты используются для отрисовки средней линии
    getCoordsForMiddleLine(laneData) {
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

    //Метод для получения координат середины перекрестка
    getCoordsForMiddlePointOnIntersection() {
        let latSum = 0
        let lonSum = 0
        let count = 0
        this.lanesData.forEach(laneData => {
            for (let i = 0; i < 1; i++) {
                latSum += laneData.lat[i]
                lonSum += laneData.lon[i]
                count++
            }
        })
        return {lat: latSum / count, lon: lonSum / count}
    }

    //Метод для получения смещения относительно координат средней полосы
    //Используется для отрисовки ширины полосы
    calculateDeltaLatLon(laneData, laneType) {
        // let angle
        // function getRightAngle(pointOne, pointTwo) {
        //     for (; ;) {
        //         const vector1 = {
        //             x: pointOne.x2 - pointOne.x1,
        //             y: pointOne.y2 - pointOne.y1
        //         }
        //         const vector2 = {
        //             x: pointTwo.x2 - pointTwo.x1,
        //             y: pointTwo.y2 - pointTwo.y1
        //         }
        //         const lengthVector1 = Math.sqrt(Math.pow(vector1.x, 2) + Math.pow((vector1.y), 2))
        //         const lengthVector2 = Math.sqrt(Math.pow((vector2.x), 2) + Math.pow((vector2.y), 2))
        //         angle = (vector1.x * vector2.x + vector1.y * vector2.y) / (lengthVector1 + lengthVector2)
        //         if (Math.cos(angle) < 1) {
        //
        //         }
        //         else {
        //
        //         }
        //     }
        // }

        let deltaLat, deltaLon
        // //Если больше изменяется долгота, то границы будут более вертикальными
        // if (Math.abs(laneData.lat[0] - laneData.lat[laneData.lat.length - 1]) < Math.abs(laneData.lon[0] - laneData.lon[laneData.lon.length - 1])) {
        //     deltaLat = getDeltaLatLon(laneData.lat[0], laneData.lon[0], (laneData.laneWidth) / 2).lat
        //     deltaLon = 0
        // }
        // //Если больше изменяется широта, то границы будут более горизонтальными
        // else {
        //     deltaLat = 0
        //     deltaLon = getDeltaLatLon(laneData.lat[0], laneData.lon[0], (laneData.laneWidth) / 2).lon
        // }
        deltaLat = getDeltaLatLon(laneData.lat[0], laneData.lon[0], (laneData.laneWidth) / 2).lat
        deltaLon = getDeltaLatLon(laneData.lat[0], laneData.lon[0], (laneData.laneWidth) / 2).lon

        return {lat: deltaLat, lon: deltaLon}
    }

    //Метод для отрисовки средней линии и направления движенеия (реализовано через polyline decorator)
    drawMiddleLineWithDecorator(coordsForMiddleLine) {
        const middleLine = L.polyline(coordsForMiddleLine, {weight: 2, color: 'white', dashArray: '8'}).addTo(this.map)
        const middleLineDecorator = L.polylineDecorator(middleLine, {
            patterns: [
                {
                    offset: '2%',
                    repeat: 50,
                    symbol: L.Symbol.arrowHead(
                        {
                            pixelSize: 5, polygon: false, pathOptions: {
                                stroke: true,
                                color: '#00ffe5'
                            }
                        })
                }
            ]
        }).addTo(this.map);
        return {middleLine, middleLineDecorator}
    }

    //Метод для отрисовки границ полосы
    drawBounds(coordsForFirstBound, coordsForSecondBound) {
        const bounds = L.polygon([...coordsForFirstBound, ...coordsForSecondBound.reverse()], {
            color: 'black',
            weight: 1,
            fillColor: 'black',
            fillOpacity: 0.5
        }).addTo(this.map)
        return bounds
    }

    //Метод для отрисовки стоп линии
    drawStopLine(coordsForMiddleLane, laneData, delta) {
        let stopLine = null
        if (laneData['directionalUse'] === '10') {
            stopLine = L.polyline([[coordsForMiddleLane[coordsForMiddleLane.length - 1][0] + delta.lat, coordsForMiddleLane[coordsForMiddleLane.length - 1][1] + delta.lon],
                [coordsForMiddleLane[coordsForMiddleLane.length - 1][0] - delta.lat, coordsForMiddleLane[coordsForMiddleLane.length - 1][1] - delta.lon]], {
                weight: 3,
                color: 'red'//'#03fce8'
            }).addTo(this.map)
        }
        return stopLine
    }

    addMouseoverEventOnLanes() {
        this.drawnLanes.forEach((drawnLane) => {
            drawnLane.bounds.on('mouseover', (e) => this.bringToFront(drawnLane))
            drawnLane.middleLineWithDecorator.middleLine.on('mouseover', (e) => this.bringToFront(drawnLane))
            drawnLane.middleLineWithDecorator.middleLineDecorator.on('mouseover', (e) => this.bringToFront(drawnLane))
            drawnLane.bounds.on('mouseout', (e) => this.bringToBack(drawnLane))
        })
    }

    //Перерисовка полос в зависимости от наведения на них мышки
    bringToFront(drawnLane) {
        drawnLane.bounds.bringToFront()
        drawnLane.bounds.setStyle({fillOpacity: 0.8})
        drawnLane.middleLineWithDecorator.middleLine.bringToFront()
        drawnLane.middleLineWithDecorator.middleLineDecorator.bringToFront()
        try {
            drawnLane.stopLine.bringToFront()
        } catch (e) {

        }
    }

    bringToBack(drawnLane) {
        drawnLane.bounds.setStyle({fillOpacity: 0.5})
    }
}

export {
    DrawingLanes
}