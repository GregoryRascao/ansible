import * as xlsx from 'xlsx'
import {format} from "date-fns";
import JsonPath from 'jsonpath';

const { book_new, book_append_sheet, json_to_sheet } = xlsx.utils
const { writeFileXLSX } = xlsx


const exportFn = function (mapping: any, data: any[]) {
  const toExport = data.map(it => transformJson(mapping, it))

  const workbook = book_new()
  const sheet = json_to_sheet(toExport)
  book_append_sheet(workbook, sheet)
  writeFileXLSX(workbook, `${format(new Date(), 'dd MMM yyyy HHmm')}-forced_failed_report.xlsx`)
}

const transformJson = function(mappingRules: any, inputJson: any) {
  const outputJson = {} as any;

  for (const outputKey in mappingRules) {
    const rule = mappingRules[outputKey];

    if (typeof rule === 'string') {
      if (rule.startsWith('$')) {
        outputJson[outputKey] = JsonPath.value(inputJson, rule);
      } else {
        const fValue = eval(rule);
        if (typeof fValue == 'function') {
          outputJson[outputKey] = fValue(inputJson);
        }
      }
    } else if (typeof rule === 'function') {
      outputJson[outputKey] = rule(inputJson);
    }
  }
  return outputJson;
}


export const Excel = {
  export: exportFn
}
