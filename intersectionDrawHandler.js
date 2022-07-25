import {getDeltaLatLon} from "./calculateDistance.js"

//Создать классы: DrawingLanes, DrawingConnectingLanes

class DrawingConnectingLines {

    constructor(drawnLanes, map) {
        this.drawnLanes = drawnLanes
        this.map = map
    }

    //Используется кривая Безье для получения дугообразной траектории
    //x - latitude, y - longitude
    //x1, y1 - начальная точка
    //x2, y2 - средняя точка
    //x3, y3 - конечная точка
    getCoordsForConnectingLine(x1, y1, x2, y2, x3, y3) {
        const arrayOfCoordsForConnectingLine = []
        const step = 0.001
        for (let t = 0; t < 1; t += step) {
            const lat = Math.pow((1 - t), 2) * x1 + 2 * (1 - t) * t * x2 + Math.pow(t, 2) * x3
            const lon = Math.pow((1 - t), 2) * y1 + 2 * (1 - t) * t * y2 + Math.pow(t, 2) * y3
            arrayOfCoordsForConnectingLine.push([lat, lon])
        }
        return arrayOfCoordsForConnectingLine
    }

    //Метод для соединения двух полос (с коротой съехать и на какую съехать)
    connectLanes(firstLane, secondLane) {

        //Координаты конца у первой полосы
        let firstLaneCoords = {
            lat: firstLane.middleLineWithDecorator.middleLine.getLatLngs().slice(-1)[0]['lat'],
            lon: firstLane.middleLineWithDecorator.middleLine.getLatLngs().slice(-1)[0]['lng']
        }

        //Кординаты начала у второй полосы
        let secondLaneCoords = {
            lat: secondLane.middleLineWithDecorator.middleLine.getLatLngs().slice(0)[0]['lat'],
            lon: secondLane.middleLineWithDecorator.middleLine.getLatLngs().slice(0)[0]['lng']
        }

        const coordsForConnectingLine = this.getCoordsForConnectingLine(firstLaneCoords.lat, firstLaneCoords.lon,
            57.965890, 56.244655, secondLaneCoords.lat, secondLaneCoords.lon)

        const connectingLine = L.polyline(coordsForConnectingLine, {
            weight: 1,
            color: 'black'
        }).addTo(this.map)

        const connectingLineDecorator = L.polylineDecorator(connectingLine, {
            patterns: [
                {
                    offset: '2%',
                    repeat: 40,
                    symbol: L.Symbol.arrowHead({
                        pixelSize: 5,
                        polygon: false,
                        pathOptions: {stroke: true}
                    })
                }
            ]
        }).addTo(this.map);

        firstLane.connectedLanes.push({connectingLine, connectingLineDecorator})
    }

    //Метод для отрисовки линий съезда
    drawConnectingLines(drawnLane) {
        //Проверка на удаление
        function checkOnRemove() {
            return drawnLane.connectingLanes.length === drawnLane.connectedLanes.length && drawnLane.connectedLanes.length !== 0
                || document.getElementById("p1").innerHTML > 0;
        }
        if (checkOnRemove()) {
            this.removeConnectingLines(drawnLane)
        }
        else {
            //Ищем полосу с нужным laneID и соединяем
            drawnLane.forEach(anotherLane => {
                if (drawnLane.connectingLanes.includes(anotherLane.laneID)) {
                    this.connectLanes(drawnLane, anotherLane)
                }

                //Добавляем дополнительную информацию для каждой полосы
                document.getElementById("p1").innerHTML =
                    `Тип полосы: ${drawnLane.laneInfo.laneType}<br>
                    Полосы для съезда: ${drawnLane.laneInfo.connectingLanes}<br>
                    Направление движения: ${drawnLane.laneInfo.directionalUse}<br>
                    ID полосы: ${drawnLane.laneInfo.laneID}<br>`
            })
        }
    }

    //По клику на любую линию будет открываться вся дополнительная информация, а также будут показываться
    //полосы, на которые можно съехать
    addClickEventOnLanes() {
        this.drawnLanes.forEach(drawnLane => {
            drawnLane.bounds.on('click', (e) => this.drawConnectingLines(drawnLane, this.map))
            drawnLane.middleLineWithDecorator.middleLine.on('click', (e) => this.drawConnectingLines(drawnLane, this.map))
            drawnLane.middleLineWithDecorator.middleLineDecorator.on('click', (e) => this.drawConnectingLines(drawnLane, this.map))
        })
    }

    //Метод для удаления линий съезда на другую полосу
    removeConnectingLines(drawnLane) {
        drawnLane.connectedLanes.forEach(connectedLane => {
            Object.values(connectedLane).forEach(value => {
                value.remove()
            })
        })
        drawnLane.connectedLanes.length = 0
    }
}

class DrawingLanes {
    constructor(lanesData, map) {
        this.lanesData = lanesData
        this.map = map
        this.drawnLanes = []
    }

    //Метод для отрисовки полос из массива lanesData
    drawLanes() {
        this.lanesData.forEach(laneData => this.drawLane(laneData))
    }

    //Метод для отрисовки элементов полосы
    drawLane(laneData) {
        //Получение данных для отрисовки
        const coordsForMiddleLine = this.getCoordsForMiddleLine(laneData)
        const delta = this.calculateDeltaLatLon(laneData)
        const coordsForFirstBound = this.getCoordsForBound(laneData, 'UP', delta.lat, delta.lon)
        const coordsForSecondBound = this.getCoordsForBound(laneData, 'DOWN', delta.lat, delta.lon)

        //Отрисовка необходимых частей
        const middleLineWithDecorator = this.drawMiddleLineWithDecorator(laneData)
        const bounds = this.drawBounds(laneData)
        const stopLine = this.drawStopLine(laneData)

        //Создаем единый объект из нарисованных объектов и добавляем в массив
        this.drawnLanes.push({
            middleLineWithDecorator,
            bounds,
            stopLine,
            delta,
            connectedLanes: []
        })
    }

    //Метод для получения координат для верхней и нижней границы
    //Данные координаты используются для отрисовки ширины полосы
    getCoordsForBound(laneData, typeBound, deltaLan, deltaLon) {
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
    getCoordsForMiddlePointOnIntersection(laneData) {}

    //Метод для получения смещения относительно координат средней полосы
    //Используется для отрисовки ширины полосы
    calculateDeltaLatLon(laneData) {
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

    //Метод для отрисовки средней линии и направления движенеия (реализовано через polyline decorator)
    drawMiddleLineWithDecorator(coordsForMiddleLine) {
        const middleLine = L.polyline(coordsForMiddleLine, {weight: 1, color: 'black'}).addTo(this.map)
        const middleLineDecorator = L.polylineDecorator(middleLine, {
            patterns: [
                {
                    offset: '2%',
                    repeat: 20,
                    symbol: L.Symbol.arrowHead(
                        {
                            pixelSize: 5, polygon: false, pathOptions: {
                                stroke: true
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
    drawStopLine(laneData) {
        let stopLine = null
        if (laneData['directionalUse'] === '10') {
            stopLine = L.polyline([[coordsMiddleLane[coordsMiddleLane.length - 1][0] + deltaLat, coordsMiddleLane[coordsMiddleLane.length - 1][1] + deltaLon],
                [coordsMiddleLane[coordsMiddleLane.length - 1][0] - deltaLat, coordsMiddleLane[coordsMiddleLane.length - 1][1] - deltaLon]], {
                weight: 3,
                color: 'red'//'#03fce8'
            }).addTo(this.map)
        }
        return stopLine
    }
}


class DrawingIntersections {
    constructor(arrayOfIntersections, map) {
        this.arrayOfIntersections = arrayOfIntersections
        this.map = map
        this.drawnLanes = []
    }

    drawIntersections() {
        this.arrayOfIntersections.forEach(intersection => {
            intersection.lanesData.forEach(laneData => {
                this.drawLane(laneData, intersection, this.map)
            })
        })
        this.addConnectingLanes()
    }

    drawIntersection(intersection) {

    }

    drawLane(laneData, intersection, map) {
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
        function CalculateDeltaLatLon() {
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
        function drawMiddleLineWithDecorator(coordsOfMiddleLine) {
            const middleLine = L.polyline(coordsOfMiddleLine, {weight: 1, color: 'black'}).addTo(map)
            const middleLineDecorator = L.polylineDecorator(middleLine, {
                patterns: [
                    {
                        offset: '2%',
                        repeat: 20,
                        symbol: L.Symbol.arrowHead({pixelSize: 5, polygon: false, pathOptions: {stroke: true}})
                    }
                ]
            }).addTo(map);
            return {middleLine, middleLineDecorator}
        }

        //Отрисовка границ для полосы
        function drawBounds(coordsOfFirstBound, coordsOfSecondBound) {
            const bounds = L.polygon([...coordsOfFirstBound, ...coordsOfSecondBound.reverse()], {
                color: 'black',
                weight: 1,
                fillColor: 'black',
                fillOpacity: 0.5
            }).addTo(map)
            return bounds
        }

        //Отрисовка стоп линии
        function drawStopLine(coordsMiddleLane, deltaLat, deltaLon) {
            let stopLine = null
            if (laneData['directionalUse'] === '10') {
                stopLine = L.polyline([[coordsMiddleLane[coordsMiddleLane.length - 1][0] + deltaLat, coordsMiddleLane[coordsMiddleLane.length - 1][1] + deltaLon],
                    [coordsMiddleLane[coordsMiddleLane.length - 1][0] - deltaLat, coordsMiddleLane[coordsMiddleLane.length - 1][1] - deltaLon]], {
                    weight: 3,
                    color: 'red'//'#03fce8'
                }).addTo(map)
            }
            return stopLine
        }


        //Получение всех координат
        const coordsOfMiddleLine = getCoordsMiddleLine()
        const delta = CalculateDeltaLatLon()
        const coordsOfFirstBound = getCoordsBoundLane('UP', delta.deltaLat, delta.deltaLon)
        const coordsOfSecondBound = getCoordsBoundLane('DOWN', delta.deltaLat, delta.deltaLon)


        //Отрисовка полосы и ее частей по координатам
        const bounds = drawBounds(coordsOfFirstBound, coordsOfSecondBound)
        const middleLineWithDecorator = drawMiddleLineWithDecorator(coordsOfMiddleLine)
        const stopLine = drawStopLine(coordsOfMiddleLine, delta.deltaLat, delta.deltaLon)

        //Создание нарисованного объекта и добавление его в массив
        this.drawnLanes.push({
            laneInfo: {
                sharedWith: laneData.sharedWith,
                maneuvers: laneData.maneuvers,
                laneType: laneData.laneType,
                directionalUse: laneData.directionalUse,
                laneID: laneData.laneID,
                connectingLanes: laneData.connectingLanes
            },
            delta,
            middleLineWithDecorator,
            bounds,
            stopLine,
            connectingLanes: laneData.connectingLanes,
            laneID: laneData.laneID,
            connectedLanes: []
        })

    }


    //Удаляет все элементы с карты
    removeDrawnLane(drawnLane) {
        Object.values(drawnLane).forEach(value => {
            if (value !== null) {
                value.remove()
            }
        })
    }

    //Добавляет линии (линии съезда на другую полосу)
    addConnectingLanes() {
        this.drawnLanes.forEach(drawnLane => {
            drawnLane.bounds.on('click', (e) => this.drawConnectingLanes(drawnLane, this.map))
            drawnLane.middleLineWithDecorator.middleLine.on('click', (e) => this.drawConnectingLanes(drawnLane, this.map))
            drawnLane.middleLineWithDecorator.middleLineDecorator.on('click', (e) => this.drawConnectingLanes(drawnLane, this.map))

        })
    }


    //Рисует линии для съезда
    drawConnectingLanes(drawnLane, map) {
        if (drawnLane.connectedLanes.length === drawnLane.connectedLanes.length && drawnLane.connectedLanes.length !== 0
            || document.getElementById("p1").innerHTML.length > 0) {
            this.removeConnectingLanes(drawnLane)
            document.getElementById("p1").innerHTML = "";

        } else {
            this.drawnLanes.forEach(anotherLane => {
                if (drawnLane.connectingLanes.includes(anotherLane.laneID)) {
                    connectLanes(drawnLane, anotherLane)
                }
                const laneInfo = `Тип полосы: ${drawnLane.laneInfo.laneType}<br>
                    Полосы для съезда: ${drawnLane.laneInfo.connectingLanes}<br>
                    Направление движения: ${drawnLane.laneInfo.directionalUse}<br>
                    ID полосы: ${drawnLane.laneInfo.laneID}<br>`
                document.getElementById("p1").innerHTML = laneInfo;
            })
        }

        function connectLanes(firstLane, secondLane) {
            function getCoordsForExitLine(x1, y1, x2, y2, x3, y3) {
                const arrayOfCoordsForExitLine = []
                const step = 0.001
                for (let t = 0; t < 1; t += step) {
                    const lat = Math.pow((1 - t), 2) * x1 + 2 * (1 - t) * t * x2 + Math.pow(t, 2) * x3
                    const lon = Math.pow((1 - t), 2) * y1 + 2 * (1 - t) * t * y2 + Math.pow(t, 2) * y3
                    arrayOfCoordsForExitLine.push([lat, lon])
                }
                return arrayOfCoordsForExitLine
            }

            //Координаты конца у первой полосы
            let firstLaneCoords = {
                lat: firstLane.middleLineWithDecorator.middleLine.getLatLngs().slice(-1)[0]['lat'],
                lon: firstLane.middleLineWithDecorator.middleLine.getLatLngs().slice(-1)[0]['lng']
            }

            //Кординаты начала у второй полосы
            let secondLaneCoords = {
                lat: secondLane.middleLineWithDecorator.middleLine.getLatLngs().slice(0)[0]['lat'],
                lon: secondLane.middleLineWithDecorator.middleLine.getLatLngs().slice(0)[0]['lng']
            }

            const coordsForExitLine = getCoordsForExitLine(firstLaneCoords.lat, firstLaneCoords.lon,
                57.965890, 56.244655, secondLaneCoords.lat, secondLaneCoords.lon)

            const exitLine = L.polyline(coordsForExitLine, {
                weight: 1,
                color: 'black'
            }).addTo(map)

            const exitLineDecorator = L.polylineDecorator(exitLine, {
                patterns: [
                    {
                        offset: '2%',
                        repeat: 40,
                        symbol: L.Symbol.arrowHead({
                            pixelSize: 5,
                            polygon: false,
                            pathOptions: {stroke: true}
                        })
                    }
                ]
            }).addTo(map);

            firstLane.connectedLanes.push({exitLine, exitLineDecorator})
        }
    }

    removeConnectingLanes(drawnLane) {
        drawnLane.connectedLanes.forEach(connectedLane => {
            Object.values(connectedLane).forEach(value => {
                value.remove()
            })
        })
        drawnLane.connectedLanes.length = 0
    }
}


export {
    DrawingIntersections
}



