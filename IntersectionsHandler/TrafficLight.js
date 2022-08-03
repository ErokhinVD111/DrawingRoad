class TrafficLight {

    constructor(spat, map, drawnLanes) {
        this.spat = spat
        this.map = map
        this.drawnLanes = drawnLanes
        this.i = 800
        this.timeCalculate()
    }

    changeLaneColor(drawnLane, state) {
        if (state.eventState === 'permissive-Movement-Allowed') {
            drawnLane.bounds.setStyle({fillColor: 'green'})
            if (drawnLane.info !== '') {
                document.getElementById("p1").innerHTML = ''
                document.getElementById("p1").innerHTML = drawnLane.info + `Traffic color: green<br>`
            }
        }
        else {
            drawnLane.bounds.setStyle({fillColor: 'red'})
            if (drawnLane.info !== '') {
                document.getElementById("p1").innerHTML = ''
                document.getElementById("p1").innerHTML += drawnLane.info + `Traffic color: red<br>`
            }
        }
    }

    checkTime(object) {
        object.spat.forEach(spatData => {
            spatData.states.forEach(state => {
                if (object.i >= state.startTime && object.i <= state.minEndTime) {
                    object.checkLaneIdAndSignalGroup(object, state)
                }
            })
        })
    }

    checkLaneIdAndSignalGroup(object, state) {
        object.drawnLanes.forEach(drawnLane => {
            if (drawnLane.laneInfo.laneID === state.signalGroup) {
                object.changeLaneColor(drawnLane, state)
            }
        })
    }

    trafficLightHandler() {
        function testFunction(object) {
            object.checkTime(object)
        }
        window.setInterval(testFunction, 100, this)
    }

    timeCalculate() {
        function testFunc(object) {
            object.i += 1
            console.log(object.i)
        }
        window.setInterval(testFunc, 100, this)
    }

    addClickEventOnLanes() {
        this.drawnLanes.forEach(drawnLane => {
            drawnLane.bounds.on('click', (e) => this.trafficLightHandler(drawnLane))
            drawnLane.middleLineWithDecorator.middleLine.on('click', (e) => this.trafficLightHandler(drawnLane))
            drawnLane.middleLineWithDecorator.middleLineDecorator.on('click', (e) => this.trafficLightHandler(drawnLane))
        })
    }

}

export {
    TrafficLight
}