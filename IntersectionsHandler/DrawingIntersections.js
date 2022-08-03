import {DrawingLanes} from "./DrawingLanes.js";
import {DrawingConnectingLines} from "./DrawingConnectingLines.js";
import {TrafficLight} from "./TrafficLight.js";
import {DrawingEventOnRoad} from "./DrawingEventOnRoad.js";

class DrawingIntersections {

    constructor(mapData, spat, denm, map) {
        this.mapData = mapData
        this.map = map
        this.spat = spat
        this.denm = denm
    }

    drawIntersections() {
        this.mapData.forEach(intersection => this.drawIntersection(intersection))
    }

    drawIntersection(intersection) {
        //Работа с отрисовкой всех полос движения
        const drawingLanes = new DrawingLanes(intersection.lanesData, this.map)
        drawingLanes.drawLanes()
        drawingLanes.addMouseoverEventOnLanes()
        //Работы с отрисовкой соединительных линий для полос движения
        const drawingConnectingLanes = new DrawingConnectingLines(drawingLanes.getDrawnLanes(), this.map)
        drawingConnectingLanes.addClickEventOnLanes()

        //Работа с отображением текущего состояния светофора
        // const trafficLight = new TrafficLight(this.spat, this.map, drawingLanes.getDrawnLanes())
        // // console.log(trafficLight)
        // trafficLight.trafficLightHandler()

        //Работа с событиями на дороге
        // const drawingEventOnRoad = new DrawingEventOnRoad(this.denm, this.map, drawingLanes.getDrawnLanes())
        // drawingEventOnRoad.drawEvent()
        // drawingEventOnRoad.addClickEventOnIcon()
    }
}

export {
    DrawingIntersections
}