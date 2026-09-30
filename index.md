---
layout: home
description: Historical ENI replay PoC and ArchiMate architecture documentation
---

<div class="hero">
  <h1>SwarmTrader Core</h1>
  <p>Historical ENI replay PoC and ArchiMate architecture documentation — a verifiable, auditable artifact that demonstrates a trading-genome replay engine works as specified.</p>
</div>

<details class="value-frame" open>
  <summary>Why this exists — value frame for stakeholders</summary>
  <div class="value-grid">
    <div>
      <h3>Who</h3>
      <p>Investors and technical evaluators who need to verify that a trading-genome replay is reproducible and traceable, not a black box.</p>
    </div>
    <div>
      <h3>Problem</h3>
      <p>Deterministic replay of a fixed trader genome over an immutable ENI market snapshot, with every chart marker traceable to the engine frame that produced it.</p>
    </div>
    <div>
      <h3>Impact of solving</h3>
      <p>A verifiable, auditable artifact demonstrating the engine works as specified; a documentation site that scales to many use cases.</p>
    </div>
    <div>
      <h3>Impact of NOT solving</h3>
      <p>An unprovable demo and opaque architecture; loss of stakeholder trust.</p>
    </div>
  </div>
</details>

<h2>Entry points</h2>
<div class="cards">
  <a class="card" href="{{ '/app/' | relative_url }}">
    <h3>PoC app</h3>
    <p>Open the fixed-genome ENI replay simulator in your browser.</p>
  </a>
  <a class="card" href="{{ '/docs/architecture/use-case-eni-replay/' | relative_url }}">
    <h3>ENI replay use case</h3>
    <p>The flagship use case: ArchiMate model, diagram, and technical detail.</p>
  </a>
  <a class="card" href="{{ '/docs/architecture/simulator-overview/' | relative_url }}">
    <h3>Architecture overview</h3>
    <p>Components, data flow, and replay lifecycle.</p>
  </a>
  <a class="card" href="{{ '/docs/MAP/' | relative_url }}">
    <h3>Documentation map</h3>
    <p>The full index of architecture, decisions, and operations docs.</p>
  </a>
</div>

<h2>Use cases</h2>
{% for c in site.data.use_cases %}
<div class="cards">
  <a class="card" href="{{ c.path | relative_url }}">
    <h3>{{ c.title }}</h3>
    <p>{{ c.summary }}</p>
  </a>
</div>
{% endfor %}
