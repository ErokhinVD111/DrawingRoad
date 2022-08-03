class DrawingEventOnRoad {
    constructor(denm, map, drawnLanes) {
        this.denm = denm
        this.map = map
        this.drawnLanes = drawnLanes
        this.icons = []
    }

    drawEvent() {
        const myIcon = L.icon({
            iconUrl: '../roadwork.png',
            iconSize: [30, 30],
        });
        const icon = L.marker([this.denm[0].eventPosition.lat, this.denm[0].eventPosition.lon], {icon: myIcon}).addTo(this.map)
        this.icons.push(icon)
    }

    addClickEventOnIcon() {
        this.icons.forEach(icon => {
            icon.on('click', (e) => {
                const info = `Объезд:${this.denm[0].trafficFlowRule}<br>
                              DrivingLaneStatus: ${this.denm[0].drivingLaneStatus}<br>
                              EventType: ${this.denm[0].eventType.causeCode}`
                if (document.getElementById("p1").innerHTML !== info)
                    document.getElementById("p1").innerHTML = info
                else {
                    document.getElementById("p1").innerHTML = ''
                }

            })
        })
    }

}

export {
    DrawingEventOnRoad
}