'use strict';

var _staticRequire = require('../core/staticRequire');

var _staticRequire2 = _interopRequireDefault(_staticRequire);

var _docsUrl = require('../docsUrl');

var _docsUrl2 = _interopRequireDefault(_docsUrl);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (0, _debug2.default)('eslint-plugin-import:rules:newline-after-import');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/**
 * @fileoverview Rule to enforce new line after import not followed by another import.
 * @author Radek Benkel
 */

function containsNodeOrEqual(outerNode, innerNode) {
  return outerNode.range[0] <= innerNode.range[0] && outerNode.range[1] >= innerNode.range[1];
}

function getScopeBody(scope) {
  if (scope.block.type === 'SwitchStatement') {
    log('SwitchStatement scopes not supported');
    return null;
  }

  const body = scope.block.body;

  if (body && body.type === 'BlockStatement') {
    return body.body;
  }

  return body;
}

function findNodeIndexInScopeBody(body, nodeToFind) {
  return body.findIndex(node => containsNodeOrEqual(node, nodeToFind));
}

function getLineDifference(node, nextNode) {
  return nextNode.loc.start.line - node.loc.end.line;
}

function isClassWithDecorator(node) {
  return node.type === 'ClassDeclaration' && node.decorators && node.decorators.length;
}

module.exports = {
  meta: {
    type: 'layout',
    docs: {
      url: (0, _docsUrl2.default)('newline-after-import')
    },
    schema: [{
      'type': 'object',
      'properties': {
        'count': {
          'type': 'integer',
          'minimum': 1
        }
      },
      'additionalProperties': false
    }],
    fixable: 'whitespace'
  },
  create: function (context) {
    let level = 0;
    const requireCalls = [];

    function checkForNewLine(node, nextNode, type) {
      if (isClassWithDecorator(nextNode)) {
        nextNode = nextNode.decorators[0];
      }

      const options = context.options[0] || { count: 1 };
      const lineDifference = getLineDifference(node, nextNode);
      const EXPECTED_LINE_DIFFERENCE = options.count + 1;

      if (lineDifference < EXPECTED_LINE_DIFFERENCE) {
        let column = node.loc.start.column;

        if (node.loc.start.line !== node.loc.end.line) {
          column = 0;
        }

        context.report({
          loc: {
            line: node.loc.end.line,
            column
          },
          message: `Expected ${options.count} empty line${options.count > 1 ? 's' : ''} \
after ${type} statement not followed by another ${type}.`,
          fix: fixer => fixer.insertTextAfter(node, '\n'.repeat(EXPECTED_LINE_DIFFERENCE - lineDifference))
        });
      }
    }

    function incrementLevel() {
      level++;
    }
    function decrementLevel() {
      level--;
    }

    return {
      ImportDeclaration: function (node) {
        const parent = node.parent;

        const nodePosition = parent.body.indexOf(node);
        const nextNode = parent.body[nodePosition + 1];

        if (nextNode && nextNode.type !== 'ImportDeclaration') {
          checkForNewLine(node, nextNode, 'import');
        }
      },
      CallExpression: function (node) {
        if ((0, _staticRequire2.default)(node) && level === 0) {
          requireCalls.push(node);
        }
      },
      'Program:exit': function () {
        log('exit processing for', context.getFilename());
        const scopeBody = getScopeBody(context.getScope());
        log('got scope:', scopeBody);

        requireCalls.forEach(function (node, index) {
          const nodePosition = findNodeIndexInScopeBody(scopeBody, node);
          log('node position in scope:', nodePosition);

          const statementWithRequireCall = scopeBody[nodePosition];
          const nextStatement = scopeBody[nodePosition + 1];
          const nextRequireCall = requireCalls[index + 1];

          if (nextRequireCall && containsNodeOrEqual(statementWithRequireCall, nextRequireCall)) {
            return;
          }

          if (nextStatement && (!nextRequireCall || !containsNodeOrEqual(nextStatement, nextRequireCall))) {

            checkForNewLine(statementWithRequireCall, nextStatement, 'require');
          }
        });
      },
      FunctionDeclaration: incrementLevel,
      FunctionExpression: incrementLevel,
      ArrowFunctionExpression: incrementLevel,
      BlockStatement: incrementLevel,
      ObjectExpression: incrementLevel,
      Decorator: incrementLevel,
      'FunctionDeclaration:exit': decrementLevel,
      'FunctionExpression:exit': decrementLevel,
      'ArrowFunctionExpression:exit': decrementLevel,
      'BlockStatement:exit': decrementLevel,
      'ObjectExpression:exit': decrementLevel,
      'Decorator:exit': decrementLevel
    };
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uZXdsaW5lLWFmdGVyLWltcG9ydC5qcyJdLCJuYW1lcyI6WyJsb2ciLCJjb250YWluc05vZGVPckVxdWFsIiwib3V0ZXJOb2RlIiwiaW5uZXJOb2RlIiwicmFuZ2UiLCJnZXRTY29wZUJvZHkiLCJzY29wZSIsImJsb2NrIiwidHlwZSIsImJvZHkiLCJmaW5kTm9kZUluZGV4SW5TY29wZUJvZHkiLCJub2RlVG9GaW5kIiwiZmluZEluZGV4Iiwibm9kZSIsImdldExpbmVEaWZmZXJlbmNlIiwibmV4dE5vZGUiLCJsb2MiLCJzdGFydCIsImxpbmUiLCJlbmQiLCJpc0NsYXNzV2l0aERlY29yYXRvciIsImRlY29yYXRvcnMiLCJsZW5ndGgiLCJtb2R1bGUiLCJleHBvcnRzIiwibWV0YSIsImRvY3MiLCJ1cmwiLCJzY2hlbWEiLCJmaXhhYmxlIiwiY3JlYXRlIiwiY29udGV4dCIsImxldmVsIiwicmVxdWlyZUNhbGxzIiwiY2hlY2tGb3JOZXdMaW5lIiwib3B0aW9ucyIsImNvdW50IiwibGluZURpZmZlcmVuY2UiLCJFWFBFQ1RFRF9MSU5FX0RJRkZFUkVOQ0UiLCJjb2x1bW4iLCJyZXBvcnQiLCJtZXNzYWdlIiwiZml4IiwiZml4ZXIiLCJpbnNlcnRUZXh0QWZ0ZXIiLCJyZXBlYXQiLCJpbmNyZW1lbnRMZXZlbCIsImRlY3JlbWVudExldmVsIiwiSW1wb3J0RGVjbGFyYXRpb24iLCJwYXJlbnQiLCJub2RlUG9zaXRpb24iLCJpbmRleE9mIiwiQ2FsbEV4cHJlc3Npb24iLCJwdXNoIiwiZ2V0RmlsZW5hbWUiLCJzY29wZUJvZHkiLCJnZXRTY29wZSIsImZvckVhY2giLCJpbmRleCIsInN0YXRlbWVudFdpdGhSZXF1aXJlQ2FsbCIsIm5leHRTdGF0ZW1lbnQiLCJuZXh0UmVxdWlyZUNhbGwiLCJGdW5jdGlvbkRlY2xhcmF0aW9uIiwiRnVuY3Rpb25FeHByZXNzaW9uIiwiQXJyb3dGdW5jdGlvbkV4cHJlc3Npb24iLCJCbG9ja1N0YXRl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LENBQWpCIiwiZmlsZSI6Im5ld2xpbmUtYWZ0ZXItaW1wb3J0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgUnVsZSB0byBlbmZvcmNlIG5ldyBsaW5lIGFmdGVyIGltcG9ydCBub3QgZm9sbG93ZWQgYnkgYW5vdGhlciBpbXBvcnQuXHJcbiAqIEBhdXRob3IgUmFkZWsgQmVua2VsXHJcbiAqL1xyXG5cclxuaW1wb3J0IGlzU3RhdGljUmVxdWlyZSBmcm9tICcuLi9jb3JlL3N0YXRpY1JlcXVpcmUnXHJcbmltcG9ydCBkb2NzVXJsIGZyb20gJy4uL2RvY3NVcmwnXHJcblxyXG5pbXBvcnQgZGVidWcgZnJvbSAnZGVidWcnXHJcbmNvbnN0IGxvZyA9IGRlYnVnKCdlc2xpbnQtcGx1Z2luLWltcG9ydDpydWxlczpuZXdsaW5lLWFmdGVyLWltcG9ydCcpXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyBSdWxlIERlZmluaXRpb25cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbmZ1bmN0aW9uIGNvbnRhaW5zTm9kZU9yRXF1YWwob3V0ZXJOb2RlLCBpbm5lck5vZGUpIHtcclxuICAgIHJldHVybiBvdXRlck5vZGUucmFuZ2VbMF0gPD0gaW5uZXJOb2RlLnJhbmdlWzBdICYmIG91dGVyTm9kZS5yYW5nZVsxXSA+PSBpbm5lck5vZGUucmFuZ2VbMV1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0U2NvcGVCb2R5KHNjb3BlKSB7XHJcbiAgICBpZiAoc2NvcGUuYmxvY2sudHlwZSA9PT0gJ1N3aXRjaFN0YXRlbWVudCcpIHtcclxuICAgICAgbG9nKCdTd2l0Y2hTdGF0ZW1lbnQgc2NvcGVzIG5vdCBzdXBwb3J0ZWQnKVxyXG4gICAgICByZXR1cm4gbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHsgYm9keSB9ID0gc2NvcGUuYmxvY2tcclxuICAgIGlmIChib2R5ICYmIGJvZHkudHlwZSA9PT0gJ0Jsb2NrU3RhdGVtZW50Jykge1xyXG4gICAgICAgIHJldHVybiBib2R5LmJvZHlcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYm9keVxyXG59XHJcblxyXG5mdW5jdGlvbiBmaW5kTm9kZUluZGV4SW5TY29wZUJvZHkoYm9keSwgbm9kZVRvRmluZCkge1xyXG4gICAgcmV0dXJuIGJvZHkuZmluZEluZGV4KChub2RlKSA9PiBjb250YWluc05vZGVPckVxdWFsKG5vZGUsIG5vZGVUb0ZpbmQpKVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRMaW5lRGlmZmVyZW5jZShub2RlLCBuZXh0Tm9kZSkge1xyXG4gIHJldHVybiBuZXh0Tm9kZS5sb2Muc3RhcnQubGluZSAtIG5vZGUubG9jLmVuZC5saW5lXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzQ2xhc3NXaXRoRGVjb3JhdG9yKG5vZGUpIHtcclxuICByZXR1cm4gbm9kZS50eXBlID09PSAnQ2xhc3NEZWNsYXJhdGlvbicgJiYgbm9kZS5kZWNvcmF0b3JzICYmIG5vZGUuZGVjb3JhdG9ycy5sZW5ndGhcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgbWV0YToge1xyXG4gICAgdHlwZTogJ2xheW91dCcsXHJcbiAgICBkb2NzOiB7XHJcbiAgICAgIHVybDogZG9jc1VybCgnbmV3bGluZS1hZnRlci1pbXBvcnQnKSxcclxuICAgIH0sXHJcbiAgICBzY2hlbWE6IFtcclxuICAgICAge1xyXG4gICAgICAgICd0eXBlJzogJ29iamVjdCcsXHJcbiAgICAgICAgJ3Byb3BlcnRpZXMnOiB7XHJcbiAgICAgICAgICAnY291bnQnOiB7XHJcbiAgICAgICAgICAgICd0eXBlJzogJ2ludGVnZXInLFxyXG4gICAgICAgICAgICAnbWluaW11bSc6IDEsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJ2FkZGl0aW9uYWxQcm9wZXJ0aWVzJzogZmFsc2UsXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG4gICAgZml4YWJsZTogJ3doaXRlc3BhY2UnLFxyXG4gIH0sXHJcbiAgY3JlYXRlOiBmdW5jdGlvbiAoY29udGV4dCkge1xyXG4gICAgbGV0IGxldmVsID0gMFxyXG4gICAgY29uc3QgcmVxdWlyZUNhbGxzID0gW11cclxuXHJcbiAgICBmdW5jdGlvbiBjaGVja0Zvck5ld0xpbmUobm9kZSwgbmV4dE5vZGUsIHR5cGUpIHtcclxuICAgICAgaWYgKGlzQ2xhc3NXaXRoRGVjb3JhdG9yKG5leHROb2RlKSkge1xyXG4gICAgICAgIG5leHROb2RlID0gbmV4dE5vZGUuZGVjb3JhdG9yc1swXVxyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBvcHRpb25zID0gY29udGV4dC5vcHRpb25zWzBdIHx8IHsgY291bnQ6IDEgfVxyXG4gICAgICBjb25zdCBsaW5lRGlmZmVyZW5jZSA9IGdldExpbmVEaWZmZXJlbmNlKG5vZGUsIG5leHROb2RlKVxyXG4gICAgICBjb25zdCBFWFBFQ1RFRF9MSU5FX0RJRkZFUkVOQ0UgPSBvcHRpb25zLmNvdW50ICsgMVxyXG5cclxuICAgICAgaWYgKGxpbmVEaWZmZXJlbmNlIDwgRVhQRUNURURfTElORV9ESUZGRVJFTkNFKSB7XHJcbiAgICAgICAgbGV0IGNvbHVtbiA9IG5vZGUubG9jLnN0YXJ0LmNvbHVtblxyXG5cclxuICAgICAgICBpZiAobm9kZS5sb2Muc3RhcnQubGluZSAhPT0gbm9kZS5sb2MuZW5kLmxpbmUpIHtcclxuICAgICAgICAgIGNvbHVtbiA9IDBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnRleHQucmVwb3J0KHtcclxuICAgICAgICAgIGxvYzoge1xyXG4gICAgICAgICAgICBsaW5lOiBub2RlLmxvYy5lbmQubGluZSxcclxuICAgICAgICAgICAgY29sdW1uLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIG1lc3NhZ2U6IGBFeHBlY3RlZCAke29wdGlvbnMuY291bnR9IGVtcHR5IGxpbmUke29wdGlvbnMuY291bnQgPiAxID8gJ3MnIDogJyd9IFxcXHJcbmFmdGVyICR7dHlwZX0gc3RhdGVtZW50IG5vdCBmb2xsb3dlZCBieSBhbm90aGVyICR7dHlwZX0uYCxcclxuICAgICAgICAgIGZpeDogZml4ZXIgPT4gZml4ZXIuaW5zZXJ0VGV4dEFmdGVyKFxyXG4gICAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgICAnXFxuJy5yZXBlYXQoRVhQRUNURURfTElORV9ESUZGRVJFTkNFIC0gbGluZURpZmZlcmVuY2UpXHJcbiAgICAgICAgICApLFxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbmNyZW1lbnRMZXZlbCgpIHtcclxuICAgICAgbGV2ZWwrK1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gZGVjcmVtZW50TGV2ZWwoKSB7XHJcbiAgICAgIGxldmVsLS1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBJbXBvcnREZWNsYXJhdGlvbjogZnVuY3Rpb24gKG5vZGUpIHtcclxuICAgICAgICBjb25zdCB7IHBhcmVudCB9ID0gbm9kZVxyXG4gICAgICAgIGNvbnN0IG5vZGVQb3NpdGlvbiA9IHBhcmVudC5ib2R5LmluZGV4T2Yobm9kZSlcclxuICAgICAgICBjb25zdCBuZXh0Tm9kZSA9IHBhcmVudC5ib2R5W25vZGVQb3NpdGlvbiArIDFdXHJcblxyXG4gICAgICAgIGlmIChuZXh0Tm9kZSAmJiBuZXh0Tm9kZS50eXBlICE9PSAnSW1wb3J0RGVjbGFyYXRpb24nKSB7XHJcbiAgICAgICAgICBjaGVja0Zvck5ld0xpbmUobm9kZSwgbmV4dE5vZGUsICdpbXBvcnQnKVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgQ2FsbEV4cHJlc3Npb246IGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgICAgICBpZiAoaXNTdGF0aWNSZXF1aXJlKG5vZGUpICYmIGxldmVsID09PSAwKSB7XHJcbiAgICAgICAgICByZXF1aXJlQ2FsbHMucHVzaChub2RlKVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgJ1Byb2dyYW06ZXhpdCc6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBsb2coJ2V4aXQgcHJvY2Vzc2luZyBmb3InLCBjb250ZXh0LmdldEZpbGVuYW1lKCkpXHJcbiAgICAgICAgY29uc3Qgc2NvcGVCb2R5ID0gZ2V0U2NvcGVCb2R5KGNvbnRleHQuZ2V0U2NvcGUoKSlcclxuICAgICAgICBsb2coJ2dvdCBzY29wZTonLCBzY29wZUJvZHkpXHJcblxyXG4gICAgICAgIHJlcXVpcmVDYWxscy5mb3JFYWNoKGZ1bmN0aW9uIChub2RlLCBpbmRleCkge1xyXG4gICAgICAgICAgY29uc3Qgbm9kZVBvc2l0aW9uID0gZmluZE5vZGVJbmRleEluU2NvcGVCb2R5KHNjb3BlQm9keSwgbm9kZSlcclxuICAgICAgICAgIGxvZygnbm9kZSBwb3NpdGlvbiBpbiBzY29wZTonLCBub2RlUG9zaXRpb24pXHJcblxyXG4gICAgICAgICAgY29uc3Qgc3RhdGVtZW50V2l0aFJlcXVpcmVDYWxsID0gc2NvcGVCb2R5W25vZGVQb3NpdGlvbl1cclxuICAgICAgICAgIGNvbnN0IG5leHRTdGF0ZW1lbnQgPSBzY29wZUJvZHlbbm9kZVBvc2l0aW9uICsgMV1cclxuICAgICAgICAgIGNvbnN0IG5leHRSZXF1aXJlQ2FsbCA9IHJlcXVpcmVDYWxsc1tpbmRleCArIDFdXHJcblxyXG4gICAgICAgICAgaWYgKG5leHRSZXF1aXJlQ2FsbCAmJiBjb250YWluc05vZGVPckVxdWFsKHN0YXRlbWVudFdpdGhSZXF1aXJlQ2FsbCwgbmV4dFJlcXVpcmVDYWxsKSkge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAobmV4dFN0YXRlbWVudCAmJlxyXG4gICAgICAgICAgICAgKCFuZXh0UmVxdWlyZUNhbGwgfHwgIWNvbnRhaW5zTm9kZU9yRXF1YWwobmV4dFN0YXRlbWVudCwgbmV4dFJlcXVpcmVDYWxsKSkpIHtcclxuXHJcbiAgICAgICAgICAgIGNoZWNrRm9yTmV3TGluZShzdGF0ZW1lbnRXaXRoUmVxdWlyZUNhbGwsIG5leHRTdGF0ZW1lbnQsICdyZXF1aXJlJylcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICB9LFxyXG4gICAgICBGdW5jdGlvbkRlY2xhcmF0aW9uOiBpbmNyZW1lbnRMZXZlbCxcclxuICAgICAgRnVuY3Rpb25FeHByZXNzaW9uOiBpbmNyZW1lbnRMZXZlbCxcclxuICAgICAgQXJyb3dGdW5jdGlvbkV4cHJlc3Npb246IGluY3JlbWVudExldmVsLFxyXG4gICAgICBCbG9ja1N0YXRlbWVudDogaW5jcmVtZW50TGV2ZWwsXHJcbiAgICAgIE9iamVjdEV4cHJlc3Npb246IGluY3JlbWVudExldmVsLFxyXG4gICAgICBEZWNvcmF0b3I6IGluY3JlbWVudExldmVsLFxyXG4gICAgICAnRnVuY3Rpb25EZWNsYXJhdGlvbjpleGl0JzogZGVjcmVtZW50TGV2ZWwsXHJcbiAgICAgICdGdW5jdGlvbkV4cHJlc3Npb246ZXhpdCc6IGRlY3JlbWVudExldmVsLFxyXG4gICAgICAnQXJyb3dGdW5jdGlvbkV4cHJlc3Npb246ZXhpdCc6IGRlY3JlbWVudExldmVsLFxyXG4gICAgICAnQmxvY2tTdGF0ZW1lbnQ6ZXhpdCc6IGRlY3JlbWVudExldmVsLFxyXG4gICAgICAnT2JqZWN0RXhwcmVzc2lvbjpleGl0JzogZGVjcmVtZW50TGV2ZWwsXHJcbiAgICAgICdEZWNvcmF0b3I6ZXhpdCc6IGRlY3JlbWVudExldmVsLFxyXG4gICAgfVxyXG4gIH0sXHJcbn1cclxuIl19