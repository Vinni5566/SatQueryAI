# SatQuery

SatQuery is an agentic vision-language system for interactive analysis of multimodal satellite imagery. It combines vision-language models, specialist remote-sensing models, and an orchestration layer to answer natural-language queries over satellite images, bi-temporal image pairs, and co-registered optical/SAR data.

The system is designed around a modular architecture where individual models operate as specialized tools and an agent dynamically determines which tools are required for a given query.

---
## Architecture

<img width="4219" height="2174" alt="mermaid-diagram (3)" src="https://github.com/user-attachments/assets/8ba57b16-a425-4ada-a606-07370d510eb6" />

---

## System Layers

### **1. Data Layer**

The data layer contains the satellite imagery, annotations, metadata, preprocessing outputs, and dataset splits required for model training and evaluation.

```
data/
├── metadata/
├── annotations/
├── imagery/
│   ├── S1/
│   └── S2/
└── sample/
    ├── sample_S1/
    └── sample_S2/
```

Main components
- BigEarthNet annotations — question-answer, captioning, MCQ, and grounding-related annotations.
- Sentinel-1 imagery — SAR data.
- Sentinel-2 imagery — optical multispectral data.
- Metadata — patch IDs, geographic information, splits, and associated annotations.
- Sample data — lightweight data for development and testing.

Large raw datasets and model weights should not be committed directly to the repository. Dataset setup and download instructions are documented separately.

### **2. Model Layer**

The model layer contains the trained or fine-tuned models used by the system.

```
models/
├── vlm/
├── change_detection/
├── grounding/
└── sar/
```

The models are intentionally separated from the agent.

The agent does not implement the underlying ML models. Instead, each model exposes an inference interface that can be consumed by an agent tool.

Conceptually:
```
Satellite Data
      ↓
Preprocessing
      ↓
Specialized Model
      ↓
Structured Model Output
      ↓
Agent Tool
```
This separation allows models to be replaced or improved without changing the orchestration logic.

### **3. Agentic Orchestration Layer**

The agent layer is responsible for understanding the user's request and determining how the available models and tools should be used.

```
agent/
├── classifier.py
├── planner.py
├── router.py
├── executor.py
├── registry.py
├── validator.py
│
├── tools/
├── schemas/
└── tests/
```

Agent pipeline

<img width="4677" height="221" alt="mermaid-diagram (4)" src="https://github.com/user-attachments/assets/40d0d8c9-8e55-43c0-81c7-6174e3f06e98" />

### Core responsibilities

- **Input Validator**: Checks whether the supplied inputs are compatible with the requested task.

Examples:

```
single image available for VQA
two temporal images available for change analysis
optical + SAR pair available for multimodal analysis
```

- **Intent Classifier**: Determines what the user is asking for.

Example intents include:

```
VQA
CAPTION
GROUNDING
CHANGE_ANALYSIS
OPTICAL_SAR_ANALYSIS
UNSUPPORTED
```

- **Router**: Maps the detected intent to the appropriate tool or workflow.

- **Planner**: Used when a request requires multiple operations.

For example:

```
"Compare these two images, identify the changes,
and explain where those changes occurred."

        ↓

Change Detection
        ↓
Change Analysis
        ↓
Visualization
        ↓
Final Response
```

Simple queries can bypass multi-step planning.

- **Tool Registry**: Maintains the available tools and their interfaces.

- **Tool Executor**: Executes selected tools and passes outputs between dependent steps.

- **Result Aggregator**: Combines outputs from multiple tools into a unified result.

- **Confidence & Evidence**: Associates the final response with model confidence, supporting evidence, and generated artifacts where applicable.

- **Execution Trace**: Records the workflow performed by the agent, providing an auditable summary of the operations used to produce the result.


### **4. Tool Layer**

Tools provide a standardized interface between the agent and the underlying ML models.

```
agent/tools/
├── base.py
├── vqa.py
├── caption.py
├── grounding.py
├── change_detection.py
├── change_analysis.py
├── sar_analysis.py
└── visualization.py
```

The agent interacts with tools rather than directly coupling itself to individual model implementations.

For example:

```
Agent
  ↓
VQA Tool
  ↓
VLM
  ↓
Answer

or:

Agent
  ↓
Change Detection Tool
  ↓
Change Detection Model
  ↓
Change Map / Structured Result
```

### **5. Backend Layer**

The backend provides the application API and connects the frontend with the agent and model infrastructure.

```
backend/
├── main.py
│
├── api/
│   ├── query.py
│   ├── upload.py
│   └── health.py
│
├── services/
│   ├── agent_service.py
│   ├── model_service.py
│   └── storage_service.py
│
└── schemas/
    ├── requests.py
    └── responses.py
```

The primary request flow is:

<img width="2388" height="1666" alt="mermaid-diagram (5)" src="https://github.com/user-attachments/assets/199aa58c-d905-4f1f-bbef-542e41db2e85" />


## 6. **Frontend Layer**

The frontend provides the interactive interface for the system.

```
frontend/
```

It is responsible for:

- image upload
- temporal image-pair selection
- optical/SAR input selection
- natural-language query input
- displaying model responses
- displaying confidence/evidence
- displaying generated visualizations
- displaying the execution summary

The frontend communicates with the backend through APIs rather than directly invoking ML models.

## **7. Storage Layer**

Runtime-generated files are kept separately from source code.

```
storage/
├── uploads/
├── results/
└── logs/
uploads/
```

User-provided satellite imagery and temporary input files.

```
results/
```

Generated outputs such as:

```
change maps
grounding results
processed imagery
generated visual artifacts
logs/
```

Application and execution logs.

8. Notebooks

The notebooks contain experimentation, preprocessing, training, evaluation, and model-development workflows.

```
notebooks/
├── m1_data/
├── m2_vlm/
└── m3_specialists/
```

Notebooks are primarily for research and development.

The production application uses the resulting models and inference interfaces rather than depending on notebook execution.

### **9. Documentation**

```
docs/
├── architecture.md
├── api.md
├── agent.md
└── model_interfaces.md
architecture.md
```

Overall system architecture and component relationships.

- api.md: Backend API endpoints, request formats, and response formats.

- agent.md: Agent workflow, intent taxonomy, routing, planning, tools, and execution traces.

- model_interfaces.md: Standard interfaces between ML models and the tool layer.

---

## Project Structure
```
SatQuery-AI/
│
├── README.md
├── requirements.txt
├── .env.example
├── .gitignore
├── docker-compose.yml
│
├── data/
│   ├── README.md
│   │
│   ├── metadata/
│   │   ├── training.csv
│   │   ├── validation.csv
│   │   └── test.csv
│   │
│   ├── annotations/
│   │   └── BigEarthNet.txt
│   │
│   ├── imagery/
│   │   ├── S1/
│   │   └── S2/
│   │
│   └── sample/
│       ├── sample_S1/
│       └── sample_S2/
│
├── notebooks/
│   │
│   ├── m1_data/
│   │   ├── 01_inspect_bigearthnet.ipynb
│   │   ├── 02_prepare_annotations.ipynb
│   │   ├── 03_match_s1_s2.ipynb
│   │   └── 04_create_splits.ipynb
│   │
│   ├── m2_vlm/
│   │   ├── 01_vlm_exploration.ipynb
│   │   ├── 02_dataset_preparation.ipynb
│   │   ├── 03_finetuning.ipynb
│   │   ├── 04_evaluation.ipynb
│   │   └── 05_inference.ipynb
│   │
│   └── m3_specialists/
│       ├── 01_change_detection.ipynb
│       ├── 02_grounding.ipynb
│       ├── 03_sar_analysis.ipynb
│       └── 04_evaluation.ipynb
│
├── models/
│   ├── vlm/
│   │   └── README.md
│   │
│   ├── change_detection/
│   │   └── README.md
│   │
│   ├── grounding/
│   │   └── README.md
│   │
│   └── sar/
│       └── README.md
│
├── agent/
│   ├── __init__.py
│   │
│   ├── classifier.py
│   ├── planner.py
│   ├── router.py
│   ├── executor.py
│   ├── registry.py
│   ├── validator.py
│   │
│   ├── tools/
│   │   ├── base.py
│   │   ├── vqa.py
│   │   ├── caption.py
│   │   ├── grounding.py
│   │   ├── change_detection.py
│   │   ├── change_analysis.py
│   │   ├── sar_analysis.py
│   │   └── visualization.py
│   │
│   ├── schemas/
│   │   ├── request.py
│   │   ├── tool.py
│   │   ├── result.py
│   │   └── trace.py
│   │
│   └── tests/
│       ├── test_classifier.py
│       ├── test_router.py
│       ├── test_tools.py
│       └── test_workflows.py
│
├── backend/
│   ├── main.py
│   │
│   ├── api/
│   │   ├── query.py
│   │   ├── upload.py
│   │   └── health.py
│   │
│   ├── services/
│   │   ├── agent_service.py
│   │   ├── model_service.py
│   │   └── storage_service.py
│   │
│   └── schemas/
│       ├── requests.py
│       └── responses.py
│
├── frontend/
│   └── ...
│
├── storage/
│   ├── uploads/
│   ├── results/
│   └── logs/
│
└── docs/
    ├── architecture.md
    ├── api.md
    ├── agent.md
    └── model_interfaces.md

```
