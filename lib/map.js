// https://stackoverflow.com/a/56150320/209184
const replacerMap = (key, value) => {
  if (value instanceof Map) {
    return {
      dataType: 'Map',
      value: [...value],
    };
  } else {
    return value;
  }
};

const reviverMap = (key, value) => {
  if (typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') {
      return new Map(value.value);
    }
  }
  return value;
};

export {replacerMap, reviverMap}