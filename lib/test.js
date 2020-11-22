list = [
    {"name": "John", "Average": 15.01, "High": 10, "DtmStamp": 1358226000000},
    {"name": "Jane", "Average": 15.02, "High": 92, "DtmStamp": 1358226000000},
    {"name": "Jane", "Average": 15.03, "High": 45, "DtmStamp": 1358226000000},
    {"name": "John", "Average": 15.04, "High": 87, "DtmStamp": 1358226000000},
    {"name": "Jane", "Average": 15.05, "High": 10, "DtmStamp": 1358226060000},
    {"name": "John", "Average": 15.06, "High": 87, "DtmStamp": 1358226060000},
    {"name": "John", "Average": 17, "High": 45, "DtmStamp": 1358226060000},
    {"name": "Jane", "Average": 18.02, "High": 92, "DtmStamp": 1358226060000}
];
function ngOnInit(n){
    const sorted = groupBy(this.list, function (item) {
        console.log(Math.floor(10 * [item.Average]));
        return Math.floor(10 * [item.Average]);
    });
    console.log(sorted);

}
function groupBy(array, f){
    const groups = {};
    array.forEach(function (o) {
        const group = JSON.stringify(f(o));
        groups[group] = groups[group] || [];
        groups[group].push(o);
    });
    console.log(groups);
    return Object.keys(groups).map(function (group) {
        let middle = 0;
        return groups[group].reduce(function(accumulator,currentValue,currentIndex,array){
            // console.log("accumulator--->",accumulator.High);
            middle = middle + groups[group][currentIndex].High;
            return middle
        });
    });
}

// reduce
ngOnInit();

// let arr = [1,2,6,3,4,5];
// let res = arr.reduce(function(accumulator,currentValue,currentIndex,array){
//     console.log("accumulator-->",accumulator);
//     return accumulator+currentValue;
// });
// console.log(res);