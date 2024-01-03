class tMap {
  constructor(props) {
    this.map = {};
  }

  get size() {
    return this.map.length();
  }

  set(key, value) {
    map[key] = value;
  }

  get(key) {
    return this.map[key];
  }

  has(key) {
    return this.map[key] !== null;
  }

  delete(key) {
    return delete this.map[key]
  }

  clear() {
    this.map = {}
  }

  forEach(callback) {
    for (const key in this.map) {
      callback(this.map[key],key)
    }
  }

}