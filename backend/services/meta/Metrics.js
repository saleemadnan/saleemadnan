class Metrics {
  constructor() {
    this.counters = new Map();
    this.histograms = new Map();
    this.gauges = new Map();
  }

  counter(name, labels = {}, value = 1) {
    const key = this.#key(name, labels);
    const prev = this.counters.get(key)?.value || 0;
    this.counters.set(key, { name, labels, value: prev + value });
  }

  histogram(name, value, labels = {}) {
    const key = this.#key(name, labels);
    const prev = this.histograms.get(key)?.values || [];
    prev.push(Number(value));
    this.histograms.set(key, { name, labels, values: prev });
  }

  gauge(name, value, labels = {}) {
    const key = this.#key(name, labels);
    this.gauges.set(key, { name, labels, value: Number(value) });
  }

  getGaugeValue(name, labels = {}) {
    const key = this.#key(name, labels);
    return this.gauges.get(key)?.value;
  }

  exportPrometheus() {
    const lines = [];

    for (const metric of this.counters.values()) {
      lines.push(`${metric.name}${this.#formatLabels(metric.labels)} ${metric.value}`);
    }

    for (const metric of this.gauges.values()) {
      lines.push(`${metric.name}${this.#formatLabels(metric.labels)} ${metric.value}`);
    }

    for (const metric of this.histograms.values()) {
      const values = metric.values;
      const sum = values.reduce((a, b) => a + b, 0);
      lines.push(`${metric.name}_count${this.#formatLabels(metric.labels)} ${values.length}`);
      lines.push(`${metric.name}_sum${this.#formatLabels(metric.labels)} ${sum}`);
    }

    return `${lines.join('\n')}\n`;
  }

  #key(name, labels = {}) {
    const sorted = Object.keys(labels).sort().map((k) => `${k}:${labels[k]}`).join('|');
    return `${name}|${sorted}`;
  }

  #formatLabels(labels = {}) {
    const keys = Object.keys(labels);
    if (keys.length === 0) {
      return '';
    }

    const serialized = keys
      .sort()
      .map((k) => `${k}="${String(labels[k]).replace(/"/g, '\\"')}"`)
      .join(',');

    return `{${serialized}}`;
  }
}

const defaultMetrics = new Metrics();

module.exports = {
  Metrics,
  defaultMetrics,
};
