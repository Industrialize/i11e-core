
const defaultDelegate = {

}

module.exports = (delegate) => {
  const ReserverdFunctions = ['setDelegate', 'process', 'acceptRobot', 'acceptBox', 'getTag'];
  let createError = require('./utils').createError;
  let Constants = require('./Constants');

  class TagProcessor {
    constructor(options = {}) {
      this.options = options;

      this.setDelegate(delegate);

      if (this.delegate.initTagProcessor) {
        this.delegate.initTagProcessor.call(this);
      }
    }

    getTag() {
      return this.delegate.getTag();
    }

    acceptRobot(robot) {
      if (this.delegate.acceptRobot) return acceptRobot(robot);
      return true;
    }

    acceptBox(box) {
      if (this.delegate.acceptBox) return acceptBox(box);
      return true;
    }

    setDelegate(delegate) {
      this.delegate = delegate;

      for (let key in this.delegate) {
        // skip predefined functions
        if (ReserverdFunctions.indexOf(key) >= 0) {
          continue;
        }

        if (typeof this.delegate[key] === 'function') {
          this[key] = this.delegate[key].bind(this);
        }
      }

      return this;
    }

    process(box, robot) {
      this.delegate.process.call(this, box, robot);
    }
  }


  return TagProcessor;
}
