import {getDeltaLatLon} from "../calculateDistance.js"

//Создать классы: DrawingLanes, DrawingConnectingLanes

//Класс для получения информации о светофорах
class TrafficLight {

    constructor() {

    }

    //Преобразование данных из XML -> jSON
    parseXMLtoJSON(stringXML) {
        //Парсинг
    }

}


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
            firstLane.coordsOfMiddleIntersection.lat, firstLane.coordsOfMiddleIntersection.lon, secondLaneCoords.lat, secondLaneCoords.lon)

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
                        pathOptions: {stroke: true, color: 'green'}
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
            if (drawnLane.connectingLanes.length === drawnLane.connectedLanes.length && drawnLane.connectedLanes.length !== 0
                || drawnLane.info.length > 0) {
                //|| document.getElementById("p1").innerHTML.length > 0) {
                return true
            }
            return false
        }

        if (checkOnRemove()) {
            this.removeConnectingLines(drawnLane)
        } else {

            //Ищем полосу с нужным laneID и соединяем
            this.drawnLanes.forEach(anotherLane => {
                anotherLane.info = ''
                if (drawnLane.connectingLanes.includes(anotherLane.laneInfo.laneID)) {
                    this.connectLanes(drawnLane, anotherLane)
                }
                //Добавляем дополнительную информацию для каждой полосы
                const info =
                    `Тип полосы: ${drawnLane.laneInfo.laneType}<br>
                    Полосы для съезда: ${drawnLane.laneInfo.connectingLanes}<br>
                    Направление движения: ${drawnLane.laneInfo.directionalUse}<br>
                    ID полосы: ${drawnLane.laneInfo.laneID}<br>`
                document.getElementById("p1").innerHTML = info
                drawnLane.info = info
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
        drawnLane.info = ''
        document.getElementById("p1").innerHTML = drawnLane.info
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

    //Возвращает массив из отрисованных объектов
    getDrawnLanes() {
        return this.drawnLanes
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
        const bounds = this.drawBounds(coordsForFirstBound, coordsForSecondBound)
        const middleLineWithDecorator = this.drawMiddleLineWithDecorator(coordsForMiddleLine)
        const stopLine = this.drawStopLine(coordsForMiddleLine, laneData, delta.lat, delta.lon)

        //Создаем единый объект из нарисованных объектов и добавляем в массив
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
            delta,
            connectedLanes: []
        })
    }

    //Метод для получения координат для верхней и нижней границы
    //Данные координаты используются для отрисовки ширины полосы
    getCoordsForBound(laneData, typeBound, deltaLat, deltaLon) {
        const coordsBoundLane = []
        for (let i = 0; i < laneData.lon.length; i++) {
            if (typeBound === 'UP') {
                coordsBoundLane.push([laneData.lat[i] + deltaLat, laneData.lon[i] + deltaLon])
            } else {
                coordsBoundLane.push([laneData.lat[i] - deltaLat, laneData.lon[i] - deltaLon])
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
        console.log('Координата перекрестка по широте:' + latSum / count)
        console.log('Координата перекрестка по долготе:' + lonSum / count)
        return {lat: latSum / count, lon: lonSum / count}
    }

    //Метод для получения смещения относительно координат средней полосы
    //Используется для отрисовки ширины полосы
    calculateDeltaLatLon(laneData) {
        let deltaLat, deltaLon
        //Если больше изменяется долгота, то границы будут более вертикальными
        if (Math.abs(laneData.lat[0] - laneData.lat[laneData.lat.length - 1]) < Math.abs(laneData.lon[0] - laneData.lon[laneData.lon.length - 1])) {
            deltaLat = getDeltaLatLon(laneData.lat[0], laneData.lon[0], (laneData.laneWidth) / 2).lat
            deltaLon = 0
        }
        //Если больше изменяется широта, то границы будут более горизонтальными
        else {
            deltaLat = 0
            deltaLon = getDeltaLatLon(laneData.lat[0], laneData.lon[0], (laneData.laneWidth) / 2).lon
        }
        return {lat: deltaLat, lon: deltaLon}
    }

    //Метод для отрисовки средней линии и направления движенеия (реализовано через polyline decorator)
    drawMiddleLineWithDecorator(coordsForMiddleLine) {
        const middleLine = L.polyline(coordsForMiddleLine, {weight: 1, color: 'white', dashArray: '8'}).addTo(this.map)
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
    drawStopLine(coordsForMiddleLane, laneData, deltaLat, deltaLon) {
        let stopLine = null
        if (laneData['directionalUse'] === '10') {
            stopLine = L.polyline([[coordsForMiddleLane[coordsForMiddleLane.length - 1][0] + deltaLat, coordsForMiddleLane[coordsForMiddleLane.length - 1][1] + deltaLon],
                [coordsForMiddleLane[coordsForMiddleLane.length - 1][0] - deltaLat, coordsForMiddleLane[coordsForMiddleLane.length - 1][1] - deltaLon]], {
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
        this.arrayOfIntersections.forEach(intersection => this.drawIntersection(intersection))
    }

    drawIntersection(intersection) {
        const drawingLanes = new DrawingLanes(intersection.lanesData, this.map)
        drawingLanes.drawLanes()
        const drawingConnectingLanes = new DrawingConnectingLines(drawingLanes.getDrawnLanes(), this.map)
        drawingConnectingLanes.addClickEventOnLanes()
    }
}

export {
    DrawingIntersections
}