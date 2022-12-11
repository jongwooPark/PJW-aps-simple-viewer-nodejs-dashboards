/// import * as Autodesk from "@types/forge-viewer";

export class SummaryPanel extends Autodesk.Viewing.UI.PropertyPanel {
    constructor(extension, id, title) {
        super(extension.viewer.container, id, title);
        this.extension = extension;
    }

    async update(model, dbids, propNames) {
        this.removeAllProperties();
       // console.log('(8-3)aggregatePropertyValues propNames=>', propNames  ); 
        for (const propName of propNames) {
            //합계, 선택한 오브젝트수, 최소값, 최대값
            //객체형변수
            const initialValue = { sum: 0, count: 0, min: Infinity, max: -Infinity };
            
            //함수선언
            // 누적한다.
            const aggregateFunc = (aggregate, value, property) => {
                return {
                    count: aggregate.count + 1,
                    sum: aggregate.sum + value,
                    min: Math.min(aggregate.min, value),
                    max: Math.max(aggregate.max, value)
                };
            };
            
            
           // console.log('(8-3)aggregatePropertyValues propName=>', propName  ); 
          
            const { sum, count, min, max } = await this.aggregatePropertyValues(model, dbids, propName, aggregateFunc, initialValue);

            if (count > 0) {
               //카테고리 이름
                const category = propName;
                //합계, 선택한 오브젝트수, 합계, 평균, 최소값, 최대값
                this.addProperty('Count', count, category);
                this.addProperty('Sum', sum.toFixed(2), category);
                this.addProperty('Avg', (sum / count).toFixed(2), category);
                this.addProperty('Min', min.toFixed(2), category);
                this.addProperty('Max', max.toFixed(2), category);

            }
        }
    }

     async aggregatePropertyValues(model, dbids, propertyName, aggregateFunc, initialValue = 0) {

       // console.log('(9-3)aggregatePropertyValues propertyName=>', propertyName  ); 
        return new Promise(function (resolve, reject) {
           
           // aggregatedValue = 오브젝트형 타입
            let aggregatedValue = initialValue;
          
          
            //**** 모델데이터에서 쿼리 , 선택한 ids, 속성명, 결과함수
           model.getBulkProperties(dbids, { propFilter: [propertyName] }, function (results) {
              //  console.log('(9-4)aggregatePropertyValues results=>', results  ); 
                for (const result of results) {
                    //필터명에 해당하는 결과값이 있으면 실행
                    if (result.properties.length > 0) {
                        const prop = result.properties[0];
                       // console.log('(9-5)aggregatedValue=>', aggregatedValue, 'prop.displayValue=>', prop.displayValue, 'prop->', prop  ); 
                       //console.log('(9-5)  aggregatedValue=>', aggregatedValue  ); 
                       //오브젝트 형 변수로서 누적한다.
                        aggregatedValue = aggregateFunc(aggregatedValue, prop.displayValue, prop);

                    }
                }
               // console.log('(9-5)aggregatePropertyValues ${propertyName} value = ', aggregatedValue  ); 
                resolve(aggregatedValue);
            }, reject);
        });
    }
}
