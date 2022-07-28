import {DrawingLanes} from "./DrawingLanes.js";
import {DrawingConnectingLines} from "./DrawingConnectingLines.js";
import {TrafficLight} from "./TrafficLight.js";

class DrawingIntersections {

    constructor(mapData, spat, map) {
        this.mapData = mapData
        this.map = map
        this.drawnLanes = []
        this.spat = spat
    }

    drawIntersections() {
        this.mapData.forEach(intersection => this.drawIntersection(intersection))
    }

    drawIntersection(intersection) {
        const drawingLanes = new DrawingLanes(intersection.lanesData, this.map)
        drawingLanes.drawLanes()
        const drawingConnectingLanes = new DrawingConnectingLines(drawingLanes.getDrawnLanes(), this.map)
        drawingConnectingLanes.addClickEventOnLanes()
        const trafficLight = new TrafficLight(this.spat, this.map, drawingLanes.getDrawnLanes())
        trafficLight.addClickEventOnLanes()
    }
}

export {
    DrawingIntersections
}