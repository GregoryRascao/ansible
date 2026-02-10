interface String {
  capitalizeFirst(): string
  splitByLength(length: number): string[]
  toTimeStr(): string
  toTime(): any
}

String.prototype.capitalizeFirst = function () {
  return this.slice(0,1).toUpperCase()+ this.slice(1)
}

String.prototype.splitByLength = function (length: number) {
  const arr = [];

  for(let index = 0; index < this.length; index += length) {
    arr.push(this.substring(index, index + length))
  }

  return arr;
}

String.prototype.toTimeStr = function () {
  const [hours, minutes, seconds] = this.splitByLength(2)

  return `${hours}:${minutes}:${seconds}`
}
String.prototype.toTime = function () {
  const [hours, minutes, seconds] = this.split(":")

  return ({ hours, minutes, seconds })
}
