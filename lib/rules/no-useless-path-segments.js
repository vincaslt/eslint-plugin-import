'use strict';

var _ignore = require('eslint-module-utils/ignore');

var _moduleVisitor = require('eslint-module-utils/moduleVisitor');

var _moduleVisitor2 = _interopRequireDefault(_moduleVisitor);

var _resolve = require('eslint-module-utils/resolve');

var _resolve2 = _interopRequireDefault(_resolve);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * convert a potentially relative path from node utils into a true
 * relative path.
 *
 * ../ -> ..
 * ./ -> .
 * .foo/bar -> ./.foo/bar
 * ..foo/bar -> ./..foo/bar
 * foo/bar -> ./foo/bar
 *
 * @param relativePath {string} relative posix path potentially missing leading './'
 * @returns {string} relative posix path that always starts with a ./
 **/
function toRelativePath(relativePath) {
  const stripped = relativePath.replace(/\/$/g, ''); // Remove trailing /

  return (/^((\.\.)|(\.))($|\/)/.test(stripped) ? stripped : `./${stripped}`
  );
} /**
   * @fileOverview Ensures that there are no useless path segments
   * @author Thomas Grainger
   */

function normalize(fn) {
  return toRelativePath(_path2.default.posix.normalize(fn));
}

function countRelativeParents(pathSegments) {
  return pathSegments.reduce((sum, pathSegment) => pathSegment === '..' ? sum + 1 : sum, 0);
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      url: (0, _docsUrl2.default)('no-useless-path-segments')
    },

    schema: [{
      type: 'object',
      properties: {
        commonjs: { type: 'boolean' },
        noUselessIndex: { type: 'boolean' }
      },
      additionalProperties: false
    }],

    fixable: 'code'
  },

  create(context) {
    const currentDir = _path2.default.dirname(context.getFilename());
    const options = context.options[0];

    function checkSourceValue(source) {
      const importPath = source.value;


      function reportWithProposedPath(proposedPath) {
        context.report({
          node: source,
          // Note: Using messageIds is not possible due to the support for ESLint 2 and 3
          message: `Useless path segments for "${importPath}", should be "${proposedPath}"`,
          fix: fixer => proposedPath && fixer.replaceText(source, JSON.stringify(proposedPath))
        });
      }

      // Only relative imports are relevant for this rule --> Skip checking
      if (!importPath.startsWith('.')) {
        return;
      }

      // Report rule violation if path is not the shortest possible
      const resolvedPath = (0, _resolve2.default)(importPath, context);
      const normedPath = normalize(importPath);
      const resolvedNormedPath = (0, _resolve2.default)(normedPath, context);
      if (normedPath !== importPath && resolvedPath === resolvedNormedPath) {
        return reportWithProposedPath(normedPath);
      }

      const fileExtensions = (0, _ignore.getFileExtensions)(context.settings);
      const regexUnnecessaryIndex = new RegExp(`.*\\/index(\\${Array.from(fileExtensions).join('|\\')})?$`);

      // Check if path contains unnecessary index (including a configured extension)
      if (options && options.noUselessIndex && regexUnnecessaryIndex.test(importPath)) {
        const parentDirectory = _path2.default.dirname(importPath);

        // Try to find ambiguous imports
        if (parentDirectory !== '.' && parentDirectory !== '..') {
          for (let fileExtension of fileExtensions) {
            if ((0, _resolve2.default)(`${parentDirectory}${fileExtension}`, context)) {
              return reportWithProposedPath(`${parentDirectory}/`);
            }
          }
        }

        return reportWithProposedPath(parentDirectory);
      }

      // Path is shortest possible + starts from the current directory --> Return directly
      if (importPath.startsWith('./')) {
        return;
      }

      // Path is not existing --> Return directly (following code requires path to be defined)
      if (resolvedPath === undefined) {
        return;
      }

      const expected = _path2.default.relative(currentDir, resolvedPath); // Expected import path
      const expectedSplit = expected.split(_path2.default.sep); // Split by / or \ (depending on OS)
      const importPathSplit = importPath.replace(/^\.\//, '').split('/');
      const countImportPathRelativeParents = countRelativeParents(importPathSplit);
      const countExpectedRelativeParents = countRelativeParents(expectedSplit);
      const diff = countImportPathRelativeParents - countExpectedRelativeParents;

      // Same number of relative parents --> Paths are the same --> Return directly
      if (diff <= 0) {
        return;
      }

      // Report and propose minimal number of required relative parents
      return reportWithProposedPath(toRelativePath(importPathSplit.slice(0, countExpectedRelativeParents).concat(importPathSplit.slice(countImportPathRelativeParents + diff)).join('/')));
    }

    return (0, _moduleVisitor2.default)(checkSourceValue, options);
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby11c2VsZXNzLXBhdGgtc2VnbWVudHMuanMiXSwibmFtZXMiOlsidG9SZWxhdGl2ZVBhdGgiLCJyZWxhdGl2ZVBhdGgiLCJzdHJpcHBlZCIsInJlcGxhY2UiLCJ0ZXN0Iiwibm9ybWFsaXplIiwiZm4iLCJwYXRoIiwicG9zaXgiLCJjb3VudFJlbGF0aXZlUGFyZW50cyIsInBhdGhTZWdtZW50cyIsInJlZHVjZSIsInN1bSIsInBhdGhTZWdtZW50IiwibW9kdWxlIiwiZXhwb3J0cyIsIm1ldGEiLCJ0eXBlIiwiZG9jcyIsInVybCIsInNjaGVtYSIsInByb3BlcnRpZXMiLCJjb21tb25qcyIsIm5vVXNlbGVzc0luZGV4IiwiYWRkaXRpb25hbFByb3BlcnRpZXMiLCJmaXhhYmxlIiwiY3JlYXRlIiwiY29udGV4dCIsImN1cnJlbnREaXIiLCJkaXJuYW1lIiwiZ2V0RmlsZW5hbWUiLCJvcHRpb25zIiwiY2hlY2tTb3VyY2VWYWx1ZSIsInNvdXJjZSIsImltcG9ydFBhdGgiLCJ2YWx1ZSIsInJlcG9ydFdpdGhQcm9wb3NlZFBhdGgiLCJwcm9wb3NlZFBhdGgiLCJyZXBvcnQiLCJub2RlIiwibWVzc2FnZSIsImZpeCIsImZpeGVyIiwicmVwbGFjZVRleHQiLCJKU09OIiwic3RyaW5naWZ5Iiwic3RhcnRzV2l0aCIsInJlc29sdmVkUGF0aCIsIm5vcm1lZFBhdGgiLCJyZXNvbHZlZE5vcm1lZFBhdGgiLCJmaWxlRXh0ZW5zaW9ucyIsInNldHRpbmdzIiwicmVnZXhVbm5lY2Vzc2FyeUluZGV4IiwiUmVnRXhwIiwiQXJyYXkiLCJmcm9tIiwiam9pbiIsInBhcmVudERpcmVjdG9yeSIsImZpbGVFeHRlbnNpb24iLCJ1bmRlZmluZWQiLCJleHBlY3RlZCIsInJlbGF0aXZlIiwiZXhwZWN0ZWRTcGxpdCIsInNwbGl0Iiwic2VwIiwiaW1wb3J0UGF0aFNwbGl0IiwiY291bnRJbXBvcnRQYXRoUmVsYXRpdmVQYXJlbnRzIiwiY291bnRFeHBl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QURaLEVBRUdHLE1BRkgsQ0FFVUwsZ0JBQWdCSSxLQUFoQixDQUFzQkgsaUNBQWlDRSxJQUF2RCxDQUZWLEVBR0daLElBSEgsQ0FHUSxHQUhSLENBREYsQ0FESyxDQUFQO0FBUUQ7O0FBRUQsV0FBTyw2QkFBY3hCLGdCQUFkLEVBQWdDRCxPQUFoQyxDQUFQO0FBQ0Q7QUF6R2MsQ0FBakIiLCJmaWxlIjoibm8tdXNlbGVzcy1wYXRoLXNlZ21lbnRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBmaWxlT3ZlcnZpZXcgRW5zdXJlcyB0aGF0IHRoZXJlIGFyZSBubyB1c2VsZXNzIHBhdGggc2VnbWVudHNcclxuICogQGF1dGhvciBUaG9tYXMgR3JhaW5nZXJcclxuICovXHJcblxyXG5pbXBvcnQgeyBnZXRGaWxlRXh0ZW5zaW9ucyB9IGZyb20gJ2VzbGludC1tb2R1bGUtdXRpbHMvaWdub3JlJ1xyXG5pbXBvcnQgbW9kdWxlVmlzaXRvciBmcm9tICdlc2xpbnQtbW9kdWxlLXV0aWxzL21vZHVsZVZpc2l0b3InXHJcbmltcG9ydCByZXNvbHZlIGZyb20gJ2VzbGludC1tb2R1bGUtdXRpbHMvcmVzb2x2ZSdcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcclxuaW1wb3J0IGRvY3NVcmwgZnJvbSAnLi4vZG9jc1VybCdcclxuXHJcbi8qKlxyXG4gKiBjb252ZXJ0IGEgcG90ZW50aWFsbHkgcmVsYXRpdmUgcGF0aCBmcm9tIG5vZGUgdXRpbHMgaW50byBhIHRydWVcclxuICogcmVsYXRpdmUgcGF0aC5cclxuICpcclxuICogLi4vIC0+IC4uXHJcbiAqIC4vIC0+IC5cclxuICogLmZvby9iYXIgLT4gLi8uZm9vL2JhclxyXG4gKiAuLmZvby9iYXIgLT4gLi8uLmZvby9iYXJcclxuICogZm9vL2JhciAtPiAuL2Zvby9iYXJcclxuICpcclxuICogQHBhcmFtIHJlbGF0aXZlUGF0aCB7c3RyaW5nfSByZWxhdGl2ZSBwb3NpeCBwYXRoIHBvdGVudGlhbGx5IG1pc3NpbmcgbGVhZGluZyAnLi8nXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9IHJlbGF0aXZlIHBvc2l4IHBhdGggdGhhdCBhbHdheXMgc3RhcnRzIHdpdGggYSAuL1xyXG4gKiovXHJcbmZ1bmN0aW9uIHRvUmVsYXRpdmVQYXRoKHJlbGF0aXZlUGF0aCkge1xyXG4gIGNvbnN0IHN0cmlwcGVkID0gcmVsYXRpdmVQYXRoLnJlcGxhY2UoL1xcLyQvZywgJycpIC8vIFJlbW92ZSB0cmFpbGluZyAvXHJcblxyXG4gIHJldHVybiAvXigoXFwuXFwuKXwoXFwuKSkoJHxcXC8pLy50ZXN0KHN0cmlwcGVkKSA/IHN0cmlwcGVkIDogYC4vJHtzdHJpcHBlZH1gXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG5vcm1hbGl6ZShmbikge1xyXG4gIHJldHVybiB0b1JlbGF0aXZlUGF0aChwYXRoLnBvc2l4Lm5vcm1hbGl6ZShmbikpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNvdW50UmVsYXRpdmVQYXJlbnRzKHBhdGhTZWdtZW50cykge1xyXG4gIHJldHVybiBwYXRoU2VnbWVudHMucmVkdWNlKChzdW0sIHBhdGhTZWdtZW50KSA9PiBwYXRoU2VnbWVudCA9PT0gJy4uJyA/IHN1bSArIDEgOiBzdW0sIDApXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIG1ldGE6IHtcclxuICAgIHR5cGU6ICdzdWdnZXN0aW9uJyxcclxuICAgIGRvY3M6IHtcclxuICAgICAgdXJsOiBkb2NzVXJsKCduby11c2VsZXNzLXBhdGgtc2VnbWVudHMnKSxcclxuICAgIH0sXHJcblxyXG4gICAgc2NoZW1hOiBbXHJcbiAgICAgIHtcclxuICAgICAgICB0eXBlOiAnb2JqZWN0JyxcclxuICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICBjb21tb25qczogeyB0eXBlOiAnYm9vbGVhbicgfSxcclxuICAgICAgICAgIG5vVXNlbGVzc0luZGV4OiB7IHR5cGU6ICdib29sZWFuJyB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYWRkaXRpb25hbFByb3BlcnRpZXM6IGZhbHNlLFxyXG4gICAgICB9LFxyXG4gICAgXSxcclxuXHJcbiAgICBmaXhhYmxlOiAnY29kZScsXHJcbiAgfSxcclxuXHJcbiAgY3JlYXRlKGNvbnRleHQpIHtcclxuICAgIGNvbnN0IGN1cnJlbnREaXIgPSBwYXRoLmRpcm5hbWUoY29udGV4dC5nZXRGaWxlbmFtZSgpKVxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IGNvbnRleHQub3B0aW9uc1swXVxyXG5cclxuICAgIGZ1bmN0aW9uIGNoZWNrU291cmNlVmFsdWUoc291cmNlKSB7XHJcbiAgICAgIGNvbnN0IHsgdmFsdWU6IGltcG9ydFBhdGggfSA9IHNvdXJjZVxyXG5cclxuICAgICAgZnVuY3Rpb24gcmVwb3J0V2l0aFByb3Bvc2VkUGF0aChwcm9wb3NlZFBhdGgpIHtcclxuICAgICAgICBjb250ZXh0LnJlcG9ydCh7XHJcbiAgICAgICAgICBub2RlOiBzb3VyY2UsXHJcbiAgICAgICAgICAvLyBOb3RlOiBVc2luZyBtZXNzYWdlSWRzIGlzIG5vdCBwb3NzaWJsZSBkdWUgdG8gdGhlIHN1cHBvcnQgZm9yIEVTTGludCAyIGFuZCAzXHJcbiAgICAgICAgICBtZXNzYWdlOiBgVXNlbGVzcyBwYXRoIHNlZ21lbnRzIGZvciBcIiR7aW1wb3J0UGF0aH1cIiwgc2hvdWxkIGJlIFwiJHtwcm9wb3NlZFBhdGh9XCJgLFxyXG4gICAgICAgICAgZml4OiBmaXhlciA9PiBwcm9wb3NlZFBhdGggJiYgZml4ZXIucmVwbGFjZVRleHQoc291cmNlLCBKU09OLnN0cmluZ2lmeShwcm9wb3NlZFBhdGgpKSxcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBPbmx5IHJlbGF0aXZlIGltcG9ydHMgYXJlIHJlbGV2YW50IGZvciB0aGlzIHJ1bGUgLS0+IFNraXAgY2hlY2tpbmdcclxuICAgICAgaWYgKCFpbXBvcnRQYXRoLnN0YXJ0c1dpdGgoJy4nKSkge1xyXG4gICAgICAgIHJldHVyblxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBSZXBvcnQgcnVsZSB2aW9sYXRpb24gaWYgcGF0aCBpcyBub3QgdGhlIHNob3J0ZXN0IHBvc3NpYmxlXHJcbiAgICAgIGNvbnN0IHJlc29sdmVkUGF0aCA9IHJlc29sdmUoaW1wb3J0UGF0aCwgY29udGV4dClcclxuICAgICAgY29uc3Qgbm9ybWVkUGF0aCA9IG5vcm1hbGl6ZShpbXBvcnRQYXRoKVxyXG4gICAgICBjb25zdCByZXNvbHZlZE5vcm1lZFBhdGggPSByZXNvbHZlKG5vcm1lZFBhdGgsIGNvbnRleHQpXHJcbiAgICAgIGlmIChub3JtZWRQYXRoICE9PSBpbXBvcnRQYXRoICYmIHJlc29sdmVkUGF0aCA9PT0gcmVzb2x2ZWROb3JtZWRQYXRoKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlcG9ydFdpdGhQcm9wb3NlZFBhdGgobm9ybWVkUGF0aClcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgZmlsZUV4dGVuc2lvbnMgPSBnZXRGaWxlRXh0ZW5zaW9ucyhjb250ZXh0LnNldHRpbmdzKVxyXG4gICAgICBjb25zdCByZWdleFVubmVjZXNzYXJ5SW5kZXggPSBuZXcgUmVnRXhwKFxyXG4gICAgICAgIGAuKlxcXFwvaW5kZXgoXFxcXCR7QXJyYXkuZnJvbShmaWxlRXh0ZW5zaW9ucykuam9pbignfFxcXFwnKX0pPyRgXHJcbiAgICAgIClcclxuXHJcbiAgICAgIC8vIENoZWNrIGlmIHBhdGggY29udGFpbnMgdW5uZWNlc3NhcnkgaW5kZXggKGluY2x1ZGluZyBhIGNvbmZpZ3VyZWQgZXh0ZW5zaW9uKVxyXG4gICAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLm5vVXNlbGVzc0luZGV4ICYmIHJlZ2V4VW5uZWNlc3NhcnlJbmRleC50ZXN0KGltcG9ydFBhdGgpKSB7XHJcbiAgICAgICAgY29uc3QgcGFyZW50RGlyZWN0b3J5ID0gcGF0aC5kaXJuYW1lKGltcG9ydFBhdGgpXHJcblxyXG4gICAgICAgIC8vIFRyeSB0byBmaW5kIGFtYmlndW91cyBpbXBvcnRzXHJcbiAgICAgICAgaWYgKHBhcmVudERpcmVjdG9yeSAhPT0gJy4nICYmIHBhcmVudERpcmVjdG9yeSAhPT0gJy4uJykge1xyXG4gICAgICAgICAgZm9yIChsZXQgZmlsZUV4dGVuc2lvbiBvZiBmaWxlRXh0ZW5zaW9ucykge1xyXG4gICAgICAgICAgICBpZiAocmVzb2x2ZShgJHtwYXJlbnREaXJlY3Rvcnl9JHtmaWxlRXh0ZW5zaW9ufWAsIGNvbnRleHQpKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcG9ydFdpdGhQcm9wb3NlZFBhdGgoYCR7cGFyZW50RGlyZWN0b3J5fS9gKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVwb3J0V2l0aFByb3Bvc2VkUGF0aChwYXJlbnREaXJlY3RvcnkpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFBhdGggaXMgc2hvcnRlc3QgcG9zc2libGUgKyBzdGFydHMgZnJvbSB0aGUgY3VycmVudCBkaXJlY3RvcnkgLS0+IFJldHVybiBkaXJlY3RseVxyXG4gICAgICBpZiAoaW1wb3J0UGF0aC5zdGFydHNXaXRoKCcuLycpKSB7XHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFBhdGggaXMgbm90IGV4aXN0aW5nIC0tPiBSZXR1cm4gZGlyZWN0bHkgKGZvbGxvd2luZyBjb2RlIHJlcXVpcmVzIHBhdGggdG8gYmUgZGVmaW5lZClcclxuICAgICAgaWYgKHJlc29sdmVkUGF0aCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGV4cGVjdGVkID0gcGF0aC5yZWxhdGl2ZShjdXJyZW50RGlyLCByZXNvbHZlZFBhdGgpIC8vIEV4cGVjdGVkIGltcG9ydCBwYXRoXHJcbiAgICAgIGNvbnN0IGV4cGVjdGVkU3BsaXQgPSBleHBlY3RlZC5zcGxpdChwYXRoLnNlcCkgLy8gU3BsaXQgYnkgLyBvciBcXCAoZGVwZW5kaW5nIG9uIE9TKVxyXG4gICAgICBjb25zdCBpbXBvcnRQYXRoU3BsaXQgPSBpbXBvcnRQYXRoLnJlcGxhY2UoL15cXC5cXC8vLCAnJykuc3BsaXQoJy8nKVxyXG4gICAgICBjb25zdCBjb3VudEltcG9ydFBhdGhSZWxhdGl2ZVBhcmVudHMgPSBjb3VudFJlbGF0aXZlUGFyZW50cyhpbXBvcnRQYXRoU3BsaXQpXHJcbiAgICAgIGNvbnN0IGNvdW50RXhwZWN0ZWRSZWxhdGl2ZVBhcmVudHMgPSBjb3VudFJlbGF0aXZlUGFyZW50cyhleHBlY3RlZFNwbGl0KVxyXG4gICAgICBjb25zdCBkaWZmID0gY291bnRJbXBvcnRQYXRoUmVsYXRpdmVQYXJlbnRzIC0gY291bnRFeHBlY3RlZFJlbGF0aXZlUGFyZW50c1xyXG5cclxuICAgICAgLy8gU2FtZSBudW1iZXIgb2YgcmVsYXRpdmUgcGFyZW50cyAtLT4gUGF0aHMgYXJlIHRoZSBzYW1lIC0tPiBSZXR1cm4gZGlyZWN0bHlcclxuICAgICAgaWYgKGRpZmYgPD0gMCkge1xyXG4gICAgICAgIHJldHVyblxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBSZXBvcnQgYW5kIHByb3Bvc2UgbWluaW1hbCBudW1iZXIgb2YgcmVxdWlyZWQgcmVsYXRpdmUgcGFyZW50c1xyXG4gICAgICByZXR1cm4gcmVwb3J0V2l0aFByb3Bvc2VkUGF0aChcclxuICAgICAgICB0b1JlbGF0aXZlUGF0aChcclxuICAgICAgICAgIGltcG9ydFBhdGhTcGxpdFxyXG4gICAgICAgICAgICAuc2xpY2UoMCwgY291bnRFeHBlY3RlZFJlbGF0aXZlUGFyZW50cylcclxuICAgICAgICAgICAgLmNvbmNhdChpbXBvcnRQYXRoU3BsaXQuc2xpY2UoY291bnRJbXBvcnRQYXRoUmVsYXRpdmVQYXJlbnRzICsgZGlmZikpXHJcbiAgICAgICAgICAgIC5qb2luKCcvJylcclxuICAgICAgICApXHJcbiAgICAgIClcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbW9kdWxlVmlzaXRvcihjaGVja1NvdXJjZVZhbHVlLCBvcHRpb25zKVxyXG4gIH0sXHJcbn1cclxuIl19