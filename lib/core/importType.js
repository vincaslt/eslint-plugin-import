'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.isAbsolute = isAbsolute;
exports.isBuiltIn = isBuiltIn;
exports.isExternalModuleMain = isExternalModuleMain;
exports.isScopedMain = isScopedMain;
exports.default = resolveImportType;

var _core = require('resolve/lib/core');

var _core2 = _interopRequireDefault(_core);

var _path = require('path');

var _resolve = require('eslint-module-utils/resolve');

var _resolve2 = _interopRequireDefault(_resolve);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function baseModule(name) {
  if (isScoped(name)) {
    var _name$split = name.split('/'),
        _name$split2 = _slicedToArray(_name$split, 2);

    const scope = _name$split2[0],
          pkg = _name$split2[1];

    return `${scope}/${pkg}`;
  }

  var _name$split3 = name.split('/'),
      _name$split4 = _slicedToArray(_name$split3, 1);

  const pkg = _name$split4[0];

  return pkg;
}

function isAbsolute(name) {
  return name.indexOf('/') === 0;
}

// path is defined only when a resolver resolves to a non-standard path
function isBuiltIn(name, settings, path) {
  if (path) return false;
  const base = baseModule(name);
  const extras = settings && settings['import/core-modules'] || [];
  return _core2.default[base] || extras.indexOf(base) > -1;
}

function isExternalPath(path, name, settings) {
  const folders = settings && settings['import/external-module-folders'] || ['node_modules'];

  // extract the part before the first / (redux-saga/effects => redux-saga)
  const packageName = name.match(/([^/]+)/)[0];

  return !path || folders.some(folder => -1 < path.indexOf((0, _path.join)(folder, packageName)));
}

const externalModuleRegExp = /^\w/;
function isExternalModule(name, settings, path) {
  return externalModuleRegExp.test(name) && isExternalPath(path, name, settings);
}

const externalModuleMainRegExp = /^[\w]((?!\/).)*$/;
function isExternalModuleMain(name, settings, path) {
  return externalModuleMainRegExp.test(name) && isExternalPath(path, name, settings);
}

const scopedRegExp = /^@[^/]+\/[^/]+/;
function isScoped(name) {
  return scopedRegExp.test(name);
}

const scopedMainRegExp = /^@[^/]+\/?[^/]+$/;
function isScopedMain(name) {
  return scopedMainRegExp.test(name);
}

function isInternalModule(name, settings, path) {
  const matchesScopedOrExternalRegExp = scopedRegExp.test(name) || externalModuleRegExp.test(name);
  return matchesScopedOrExternalRegExp && !isExternalPath(path, name, settings);
}

function isRelativeToParent(name) {
  return (/^\.\.[\\/]/.test(name)
  );
}

const indexFiles = ['.', './', './index', './index.js'];
function isIndex(name) {
  return indexFiles.indexOf(name) !== -1;
}

function isRelativeToSibling(name) {
  return (/^\.[\\/]/.test(name)
  );
}

function typeTest(name, settings, path) {
  if (isAbsolute(name, settings, path)) {
    return 'absolute';
  }
  if (isBuiltIn(name, settings, path)) {
    return 'builtin';
  }
  if (isInternalModule(name, settings, path)) {
    return 'internal';
  }
  if (isExternalModule(name, settings, path)) {
    return 'external';
  }
  if (isScoped(name, settings, path)) {
    return 'external';
  }
  if (isRelativeToParent(name, settings, path)) {
    return 'parent';
  }
  if (isIndex(name, settings, path)) {
    return 'index';
  }
  if (isRelativeToSibling(name, settings, path)) {
    return 'sibling';
  }
  return 'unknown';
}

function resolveImportType(name, context) {
  return typeTest(name, context.settings, (0, _resolve2.default)(name, context));
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb3JlL2ltcG9ydFR5cGUuanMiXSwibmFtZXMiOlsiaXNBYnNvbHV0ZSIsImlzQnVpbHRJbiIsImlzRXh0ZXJuYWxNb2R1bGVNYWluIiwiaXNTY29wZWRNYWluIiwicmVzb2x2ZUltcG9ydFR5cGUiLCJiYXNlTW9kdWxlIiwibmFtZSIsImlzU2NvcGVkIiwic3BsaXQiLCJzY29wZSIsInBrZyIsImluZGV4T2YiLCJzZXR0aW5ncyIsInBhdGgiLCJiYXNlIiwiZXh0cmFzIiwiY29yZU1vZHVsZXMiLCJpc0V4dGVybmFsUGF0aCIsImZvbGRlcnMiLCJwYWNrYWdlTmFtZSIsIm1hdGNoIiwic29tZSIsImZvbGRlciIsImV4dGVybmFsTW9kdWxlUmVnRXhwIiwiaXNFeHRlcm5hbE1vZHVsZSIsInRlc3QiLCJleHRlcm5hbE1vZHVsZU1haW5SZWdFeHAiLCJzY29wZWRSZWdFeHAiLCJzY29wZWRNYWluUmVnRXhwIiwiaXNJbnRlcm5hbE1vZHVsZSIsIm1hdGNoZXNTY29wZWRPckV4dGVybmFsUmVnRXhwIiwiaXNSZWxhdGl2ZVRvUGFyZW50IiwiaW5kZXhGaWxlcyIsImlzSW5kZXgiLCJpc1JlbGF0aXZlVG9TaWJsaW5nIiwidHlwZVRlc3QiLCJjb250ZXh0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7OztRQWNnQkEsVSxHQUFBQSxVO1FBS0FDLFMsR0FBQUEsUztRQXNCQUMsb0IsR0FBQUEsb0I7UUFVQUMsWSxHQUFBQSxZO2tCQWtDUUMsaUI7O0FBckZ4Qjs7OztBQUNBOztBQUVBOzs7Ozs7QUFFQSxTQUFTQyxVQUFULENBQW9CQyxJQUFwQixFQUEwQjtBQUN4QixNQUFJQyxTQUFTRCxJQUFULENBQUosRUFBb0I7QUFBQSxzQkFDR0EsS0FBS0UsS0FBTCxDQUFXLEdBQVgsQ0FESDtBQUFBOztBQUFBLFVBQ1hDLEtBRFc7QUFBQSxVQUNKQyxHQURJOztBQUVsQixXQUFRLEdBQUVELEtBQU0sSUFBR0MsR0FBSSxFQUF2QjtBQUNEOztBQUp1QixxQkFL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SUFBVCxFQUFlOEIsUUFBUXhCLFFBQXZCLEVBQWlDLHVCQUFRTixJQUFSLEVBQWM4QixPQUFkLENBQWpDLENBQVA7QUFDRCIsImZpbGUiOiJpbXBvcnRUeXBlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNvcmVNb2R1bGVzIGZyb20gJ3Jlc29sdmUvbGliL2NvcmUnXHJcbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJ1xyXG5cclxuaW1wb3J0IHJlc29sdmUgZnJvbSAnZXNsaW50LW1vZHVsZS11dGlscy9yZXNvbHZlJ1xyXG5cclxuZnVuY3Rpb24gYmFzZU1vZHVsZShuYW1lKSB7XHJcbiAgaWYgKGlzU2NvcGVkKG5hbWUpKSB7XHJcbiAgICBjb25zdCBbc2NvcGUsIHBrZ10gPSBuYW1lLnNwbGl0KCcvJylcclxuICAgIHJldHVybiBgJHtzY29wZX0vJHtwa2d9YFxyXG4gIH1cclxuICBjb25zdCBbcGtnXSA9IG5hbWUuc3BsaXQoJy8nKVxyXG4gIHJldHVybiBwa2dcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzQWJzb2x1dGUobmFtZSkge1xyXG4gIHJldHVybiBuYW1lLmluZGV4T2YoJy8nKSA9PT0gMFxyXG59XHJcblxyXG4vLyBwYXRoIGlzIGRlZmluZWQgb25seSB3aGVuIGEgcmVzb2x2ZXIgcmVzb2x2ZXMgdG8gYSBub24tc3RhbmRhcmQgcGF0aFxyXG5leHBvcnQgZnVuY3Rpb24gaXNCdWlsdEluKG5hbWUsIHNldHRpbmdzLCBwYXRoKSB7XHJcbiAgaWYgKHBhdGgpIHJldHVybiBmYWxzZVxyXG4gIGNvbnN0IGJhc2UgPSBiYXNlTW9kdWxlKG5hbWUpXHJcbiAgY29uc3QgZXh0cmFzID0gKHNldHRpbmdzICYmIHNldHRpbmdzWydpbXBvcnQvY29yZS1tb2R1bGVzJ10pIHx8IFtdXHJcbiAgcmV0dXJuIGNvcmVNb2R1bGVzW2Jhc2VdIHx8IGV4dHJhcy5pbmRleE9mKGJhc2UpID4gLTFcclxufVxyXG5cclxuZnVuY3Rpb24gaXNFeHRlcm5hbFBhdGgocGF0aCwgbmFtZSwgc2V0dGluZ3MpIHtcclxuICBjb25zdCBmb2xkZXJzID0gKHNldHRpbmdzICYmIHNldHRpbmdzWydpbXBvcnQvZXh0ZXJuYWwtbW9kdWxlLWZvbGRlcnMnXSkgfHwgWydub2RlX21vZHVsZXMnXVxyXG5cclxuICAvLyBleHRyYWN0IHRoZSBwYXJ0IGJlZm9yZSB0aGUgZmlyc3QgLyAocmVkdXgtc2FnYS9lZmZlY3RzID0+IHJlZHV4LXNhZ2EpXHJcbiAgY29uc3QgcGFja2FnZU5hbWUgPSBuYW1lLm1hdGNoKC8oW14vXSspLylbMF1cclxuXHJcbiAgcmV0dXJuICFwYXRoIHx8IGZvbGRlcnMuc29tZShmb2xkZXIgPT4gLTEgPCBwYXRoLmluZGV4T2Yoam9pbihmb2xkZXIsIHBhY2thZ2VOYW1lKSkpXHJcbn1cclxuXHJcbmNvbnN0IGV4dGVybmFsTW9kdWxlUmVnRXhwID0gL15cXHcvXHJcbmZ1bmN0aW9uIGlzRXh0ZXJuYWxNb2R1bGUobmFtZSwgc2V0dGluZ3MsIHBhdGgpIHtcclxuICByZXR1cm4gZXh0ZXJuYWxNb2R1bGVSZWdFeHAudGVzdChuYW1lKSAmJiBpc0V4dGVybmFsUGF0aChwYXRoLCBuYW1lLCBzZXR0aW5ncylcclxufVxyXG5cclxuY29uc3QgZXh0ZXJuYWxNb2R1bGVNYWluUmVnRXhwID0gL15bXFx3XSgoPyFcXC8pLikqJC9cclxuZXhwb3J0IGZ1bmN0aW9uIGlzRXh0ZXJuYWxNb2R1bGVNYWluKG5hbWUsIHNldHRpbmdzLCBwYXRoKSB7XHJcbiAgcmV0dXJuIGV4dGVybmFsTW9kdWxlTWFpblJlZ0V4cC50ZXN0KG5hbWUpICYmIGlzRXh0ZXJuYWxQYXRoKHBhdGgsIG5hbWUsIHNldHRpbmdzKVxyXG59XHJcblxyXG5jb25zdCBzY29wZWRSZWdFeHAgPSAvXkBbXi9dK1xcL1teL10rL1xyXG5mdW5jdGlvbiBpc1Njb3BlZChuYW1lKSB7XHJcbiAgcmV0dXJuIHNjb3BlZFJlZ0V4cC50ZXN0KG5hbWUpXHJcbn1cclxuXHJcbmNvbnN0IHNjb3BlZE1haW5SZWdFeHAgPSAvXkBbXi9dK1xcLz9bXi9dKyQvXHJcbmV4cG9ydCBmdW5jdGlvbiBpc1Njb3BlZE1haW4obmFtZSkge1xyXG4gIHJldHVybiBzY29wZWRNYWluUmVnRXhwLnRlc3QobmFtZSlcclxufVxyXG5cclxuZnVuY3Rpb24gaXNJbnRlcm5hbE1vZHVsZShuYW1lLCBzZXR0aW5ncywgcGF0aCkge1xyXG4gIGNvbnN0IG1hdGNoZXNTY29wZWRPckV4dGVybmFsUmVnRXhwID0gc2NvcGVkUmVnRXhwLnRlc3QobmFtZSkgfHwgZXh0ZXJuYWxNb2R1bGVSZWdFeHAudGVzdChuYW1lKVxyXG4gIHJldHVybiAobWF0Y2hlc1Njb3BlZE9yRXh0ZXJuYWxSZWdFeHAgJiYgIWlzRXh0ZXJuYWxQYXRoKHBhdGgsIG5hbWUsIHNldHRpbmdzKSlcclxufVxyXG5cclxuZnVuY3Rpb24gaXNSZWxhdGl2ZVRvUGFyZW50KG5hbWUpIHtcclxuICByZXR1cm4gL15cXC5cXC5bXFxcXC9dLy50ZXN0KG5hbWUpXHJcbn1cclxuXHJcbmNvbnN0IGluZGV4RmlsZXMgPSBbJy4nLCAnLi8nLCAnLi9pbmRleCcsICcuL2luZGV4LmpzJ11cclxuZnVuY3Rpb24gaXNJbmRleChuYW1lKSB7XHJcbiAgcmV0dXJuIGluZGV4RmlsZXMuaW5kZXhPZihuYW1lKSAhPT0gLTFcclxufVxyXG5cclxuZnVuY3Rpb24gaXNSZWxhdGl2ZVRvU2libGluZyhuYW1lKSB7XHJcbiAgcmV0dXJuIC9eXFwuW1xcXFwvXS8udGVzdChuYW1lKVxyXG59XHJcblxyXG5mdW5jdGlvbiB0eXBlVGVzdChuYW1lLCBzZXR0aW5ncywgcGF0aCkge1xyXG4gIGlmIChpc0Fic29sdXRlKG5hbWUsIHNldHRpbmdzLCBwYXRoKSkgeyByZXR1cm4gJ2Fic29sdXRlJyB9XHJcbiAgaWYgKGlzQnVpbHRJbihuYW1lLCBzZXR0aW5ncywgcGF0aCkpIHsgcmV0dXJuICdidWlsdGluJyB9XHJcbiAgaWYgKGlzSW50ZXJuYWxNb2R1bGUobmFtZSwgc2V0dGluZ3MsIHBhdGgpKSB7IHJldHVybiAnaW50ZXJuYWwnIH1cclxuICBpZiAoaXNFeHRlcm5hbE1vZHVsZShuYW1lLCBzZXR0aW5ncywgcGF0aCkpIHsgcmV0dXJuICdleHRlcm5hbCcgfVxyXG4gIGlmIChpc1Njb3BlZChuYW1lLCBzZXR0aW5ncywgcGF0aCkpIHsgcmV0dXJuICdleHRlcm5hbCcgfVxyXG4gIGlmIChpc1JlbGF0aXZlVG9QYXJlbnQobmFtZSwgc2V0dGluZ3MsIHBhdGgpKSB7IHJldHVybiAncGFyZW50JyB9XHJcbiAgaWYgKGlzSW5kZXgobmFtZSwgc2V0dGluZ3MsIHBhdGgpKSB7IHJldHVybiAnaW5kZXgnIH1cclxuICBpZiAoaXNSZWxhdGl2ZVRvU2libGluZyhuYW1lLCBzZXR0aW5ncywgcGF0aCkpIHsgcmV0dXJuICdzaWJsaW5nJyB9XHJcbiAgcmV0dXJuICd1bmtub3duJ1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZXNvbHZlSW1wb3J0VHlwZShuYW1lLCBjb250ZXh0KSB7XHJcbiAgcmV0dXJuIHR5cGVUZXN0KG5hbWUsIGNvbnRleHQuc2V0dGluZ3MsIHJlc29sdmUobmFtZSwgY29udGV4dCkpXHJcbn1cclxuIl19