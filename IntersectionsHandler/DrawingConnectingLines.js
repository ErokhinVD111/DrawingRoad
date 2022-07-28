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
    drawConnectingLines(firstLane, secondLane, color) {

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
                        pathOptions: {stroke: true, color: color}
                    })
                }
            ]
        }).addTo(this.map);

        firstLane.connectedLanes.push({connectingLine, connectingLineDecorator})
    }

    //Метод для отрисовки линий съезда
    findConnectingLines(drawnLane) {

        //Проверка на удаление
        function checkOnRemove() {
            return drawnLane.connectingLanes.length === drawnLane.connectedLanes.length && drawnLane.connectedLanes.length !== 0
                || drawnLane.info.length > 0;

        }
        if (checkOnRemove()) {
            this.removeConnectingLines(drawnLane)
        }
        else {
            //Задаем цвет для соединительных линий
            const color = '#' + (Math.random().toString(16) + '000000').substring(2,8).toUpperCase()
            //Ищем полосу с нужным laneID и соединяем
            this.drawnLanes.forEach(anotherLane => {
                anotherLane.info = ''
                if (drawnLane.connectingLanes.includes(anotherLane.laneInfo.laneID)) {
                    this.drawConnectingLines(drawnLane, anotherLane, color)
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
            drawnLane.bounds.on('click', (e) => this.findConnectingLines(drawnLane, this.map))
            drawnLane.middleLineWithDecorator.middleLine.on('click', (e) => this.findConnectingLines(drawnLane, this.map))
            drawnLane.middleLineWithDecorator.middleLineDecorator.on('click', (e) => this.findConnectingLines(drawnLane, this.map))
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

    //Метод для получения объектов (полос)
    getDrawnLanes() {
        return this.drawnLanes
    }
}

export {
    DrawingConnectingLines
}