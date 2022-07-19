class Map {
    constructor(link, attributes) {
        this.map = L.map('map')
        L.tileLayer(link, {
            ...attributes
        }).addTo(this.map);
    }
}

class MapFactory {
    static getMap(link, attributes) {
        return new Map(link, attributes)
    }
}

export default MapFactory