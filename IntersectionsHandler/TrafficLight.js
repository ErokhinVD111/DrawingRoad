class TrafficLight {

    constructor(spat, map, drawnLanes) {
        this.spat = spat
        this.map = map
        this.drawnLanes = drawnLanes
    }

    trafficLightControl() {
        document.getElementById("p1").innerHTML += `<br>Светофор: red`
    }

    addClickEventOnLanes() {
        this.drawnLanes.forEach(drawnLane => {
            drawnLane.bounds.on('click', (e) => this.trafficLightControl())
            drawnLane.middleLineWithDecorator.middleLine.on('click', (e) => this.trafficLightControl())
            drawnLane.middleLineWithDecorator.middleLineDecorator.on('click', (e) => this.trafficLightControl())
        })
    }

}

export {
    TrafficLight
}