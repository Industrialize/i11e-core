class TagProcessorRegistry {
  constructor() {
    this.registry = {};
  }

  register(processor) {
    let tag = processor.getTag();
    if (!this.registry.hasOwnProperty(tag)) {
      this.registry[tag] = [];
    }

    this.registry[tag].add(processor);
  }

  getTagEntries() {
    return Object.keys(this.registry);
  }

  getProcessors(tag) {
    if (this.registry.hasOwnProperty(tag)) {
      return this.registry[tag];
    }
    return [];
  }
}

module.exports = TagProcessorRegistry;
