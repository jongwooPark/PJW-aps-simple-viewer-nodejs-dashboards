/// import * as Autodesk from "@types/forge-viewer";
/// import * as Chart from "@types/chart.js";

export class HistogramPanel extends Autodesk.Viewing.UI.DockingPanel {
    constructor(extension, id, title, options) {
        super(extension.viewer.container, id, title, options);
        this.extension = extension;
        this.container.style.left = (options.x || 0) + 'px';
        this.container.style.top = (options.y || 0) + 'px';
        this.container.style.width = (options.width || 500) + 'px';
        //도킹판넬사이즈
        this.container.style.height = (options.height || 450) + 'px';
        this.container.style.resize = 'none';
        this.chartType = options.chartType || 'bar'; // See https://www.chartjs.org/docs/latest for all the supported types of charts
        this.chart = this.createChart();
    }

    initialize() {
        this.title = this.createTitleBar(this.titleLabel || this.container.id);
        this.initializeMoveHandlers(this.title);
        this.container.appendChild(this.title);
        this.content = document.createElement('div');
        //도킹판넬의 컨테이너 사이즈
        this.content.style.height = '450px';
        this.content.style.backgroundColor = 'white';
        this.content.innerHTML = `
            <div class="props-container" style="position: relative; height: 25px; padding: 0.5em;">
                <select class="props"></select>
            </div>
            <div class="chart-container" style="position: relative; height: 325px; padding: 0.5em;">
                <canvas class="chart" style='height: 281.8px;'></canvas>
            </div>
        `;
        this.select = this.content.querySelector('select.props');
        this.canvas = this.content.querySelector('canvas.chart');
        this.container.appendChild(this.content);
    }

    createChart() {
        return new Chart(this.canvas.getContext('2d'), {
            type: this.chartType,
            data: {
                labels: [],
                datasets: [{ data: [], backgroundColor: [], borderColor: [], borderWidth: 1 }],
            },
            options: { maintainAspectRatio: false }
        });
    }

    async setModel(model) {

        //전체 속성 선택리스트 세팅
        const propertyNames = await this.extension.findPropertyNames(model);
        
        ////속성이름으로 검색 약 270개 종류의 속성이 있음
        //예)Category, Level, 건물명, Elevation....
       // console.log('(20) propertyNames - >', propertyNames);
        this.select.innerHTML = propertyNames.map(prop => `<option value="${prop}">${prop}</option>`).join('\n');
        //선택이 바뀌면 챠트 업데이트
        this.select.onchange = () => this.updateChart(model, this.select.value);
        this.updateChart(model, this.select.value);
    }

    async updateChart(model, propName) {
        
        

      //각 속성이름으로 검색
        const histogram = await this.extension.findPropertyValueOccurrences(model, propName);
      
       // console.log('(20) propName - >', propName);
        console.log('(20) histogram - >', histogram);
        const propertyValues = Array.from(histogram.keys());
        console.log('(21) propertyValues - >', propertyValues);
        this.chart.data.labels = propertyValues;
        const dataset = this.chart.data.datasets[0];
        dataset.label = propName;
        dataset.data = propertyValues.map(val => histogram.get(val).length);
        if (dataset.data.length > 0) {
            const hslaColors = dataset.data.map((val, index) => `hsla(${Math.round(index * (360 / dataset.data.length))}, 100%, 50%, 0.2)`);
            dataset.backgroundColor = dataset.borderColor = hslaColors;
        }
        this.chart.update();
        this.chart.config.options.onClick = (ev, items) => {
            if (items.length === 1) {
                const index = items[0].index;
                const dbids = histogram.get(propertyValues[index]);
                this.extension.viewer.isolate(dbids);
                this.extension.viewer.fitToView(dbids);
            }
        };
    }
}
