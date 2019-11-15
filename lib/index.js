'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
const rules = exports.rules = {
  'no-unresolved': require('./rules/no-unresolved'),
  'named': require('./rules/named'),
  'default': require('./rules/default'),
  'namespace': require('./rules/namespace'),
  'no-namespace': require('./rules/no-namespace'),
  'export': require('./rules/export'),
  'no-mutable-exports': require('./rules/no-mutable-exports'),
  'extensions': require('./rules/extensions'),
  'no-restricted-paths': require('./rules/no-restricted-paths'),
  'no-internal-modules': require('./rules/no-internal-modules'),
  'group-exports': require('./rules/group-exports'),
  'no-relative-parent-imports': require('./rules/no-relative-parent-imports'),

  'no-self-import': require('./rules/no-self-import'),
  'no-cycle': require('./rules/no-cycle'),
  'no-named-default': require('./rules/no-named-default'),
  'no-named-as-default': require('./rules/no-named-as-default'),
  'no-named-as-default-member': require('./rules/no-named-as-default-member'),
  'no-anonymous-default-export': require('./rules/no-anonymous-default-export'),
  'no-unused-modules': require('./rules/no-unused-modules'),

  'no-commonjs': require('./rules/no-commonjs'),
  'no-amd': require('./rules/no-amd'),
  'no-duplicates': require('./rules/no-duplicates'),
  'first': require('./rules/first'),
  'max-dependencies': require('./rules/max-dependencies'),
  'no-extraneous-dependencies': require('./rules/no-extraneous-dependencies'),
  'no-absolute-path': require('./rules/no-absolute-path'),
  'no-nodejs-modules': require('./rules/no-nodejs-modules'),
  'no-webpack-loader-syntax': require('./rules/no-webpack-loader-syntax'),
  'order': require('./rules/order'),
  'newline-after-import': require('./rules/newline-after-import'),
  'prefer-default-export': require('./rules/prefer-default-export'),
  'no-default-export': require('./rules/no-default-export'),
  'no-named-export': require('./rules/no-named-export'),
  'no-dynamic-require': require('./rules/no-dynamic-require'),
  'unambiguous': require('./rules/unambiguous'),
  'no-unassigned-import': require('./rules/no-unassigned-import'),
  'no-useless-path-segments': require('./rules/no-useless-path-segments'),
  'dynamic-import-chunkname': require('./rules/dynamic-import-chunkname'),

  // export
  'exports-last': require('./rules/exports-last'),

  // metadata-based
  'no-deprecated': require('./rules/no-deprecated'),

  // deprecated aliases to rules
  'imports-first': require('./rules/imports-first')
};

const configs = exports.configs = {
  'recommended': require('../config/recommended'),

  'errors': require('../config/errors'),
  'warnings': require('../config/warnings'),

  // shhhh... work in progress "secret" rules
  'stage-0': require('../config/stage-0'),

  // useful stuff for folks using various environments
  'react': require('../config/react'),
  'react-native': require('../config/react-native'),
  'electron': require('../config/electron'),
  'typescript': require('../config/typescript')
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJydWxlcyIsInJlcXVpcmUiLCJjb25maWdzIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFPLE1BQU1BLHdCQUFRO0FBQ25CLG1CQUFpQkMsUUFBUSx1QkFBUixDQURFO0FBRW5CLFdBQVNBLFFBQVEsZUFBUixDQUZVO0FBR25CLGFBQVdBLFFBQVEsaUJBQVIsQ0FIUTtBQUluQixlQUFhQSxRQUFRLG1CQUFSLENBSk07QUFLbkIsa0JBQWdCQSxRQUFRLHNCQUFSLENBTEc7QUFNbkIsWUFBVUEsUUFBUSxnQkFBUixDQU5TO0FBT25CLHdCQUFzQkEsUUFBUSw0QkFBUixDQVBIO0FBUW5CLGdCQUFjQSxRQUFRLG9CQUFSLENBUks7QUFTbkIseUJBQXVCQSxRQUFRLDZCQUFSLENBVEo7QUFVbkIseUJBQXVCQSxRQUFRLDZCQUFSLENBVko7QUFXbkIsbUJBQWlCQSxRQUFRLHVCQUFSLENBWEU7QUFZbkIsZ0NBQThCQSxRQUFRLG9DQUFSLENBWlg7O0FBY25CLG9CQUFrQkEsUUFBUSx3QkFBUixDQWRDO0FBZW5CLGNBQVlBLFFBQVEsa0JBQVIsQ0FmTztBQWdCbkIsc0JBQW9CQSxRQUFRLDBCQUFSLENBaEJEO0FBaUJuQix5QkFBdUJBLFFBQVEsNkJBQVIsQ0FqQko7QUFrQm5CLGdDQUE4QkEsUUFBUSxvQ0FBUixDQWxCWDtBQW1CbkIsaUNBQStCQSxRQUFRLHFDQUFSLENBbkJaO0FBb0JuQix1QkFBcUJBLFFBQVEsMkJBQVIsQ0FwQkY7O0FBc0JuQixpQkFBZUEsUUFBUSxxQkFBUixDQXRCSTtBQXVCbkIsWUFBVUEsUUFBUSxnQkFBUixDQXZCUztBQXdCbkIsbUJBQWlCQSxRQUFRLHVCQUFSLENBeEJFO0FBeUJuQixXQUFTQSxRQUFRLGVBQVIsQ0F6QlU7QUEwQm5CLHNCQUFvQkEsUUFBUSwwQkFBUixDQTFCRDtBQTJCbkIsZ0NBQThCQSxRQUFRLG9DQUFSLENBM0JYO0FBNEJuQixzQkFBb0JBLFFBQVEsMEJBQVIsQ0E1QkQ7QUE2Qm5CLHVCQUFxQkEsUUFBUSwyQkFBUixDQTdCRjtBQThCbkIsOEJBQTRCQSxRQUFRLGtDQUFSLENBOUJUO0FBK0JuQixXQUFTQSxRQUFRLGVBQVIsQ0EvQlU7QUFnQ25CLDBCQUF3QkEsUUFBUSw4QkFBUixDQWhDTDtBQWlDbkIsMkJBQXlCQSxRQUFRLCtCQUFSLENBakNOO0FBa0NuQix1QkFBcUJBLFFBQVEsMkJBQVIsQ0FsQ0Y7QUFtQ25CLHFCQUFtQkEsUUFBUSx5QkFBUixDQW5DQTtBQW9DbkIsd0JBQXNCQSxRQUFRLDRCQUFSLENBcENIO0FBcUNuQixpQkFBZUEsUUFBUSxxQkFBUixDQXJDSTtBQXNDbkIsMEJBQXdCQSxRQUFRLDhCQUFSLENBdENMO0FBdUNuQiw4QkFBNEJBLFFBQVEsa0NBQVIsQ0F2Q1Q7QUF3Q25CLDhCQUE0QkEsUUFBUSxrQ0FBUixDQXhDVDs7QUEwQ25CO0FBQ0Esa0JBQWdCQSxRQUFRLHNCQUFSLENBM0NHOztBQTZDbkI7QUFDQSxtQkFBaUJBLFFBQVEsdUJBQVIsQ0E5Q0U7O0FBZ0RuQjtBQUNBLG1CQUFpQkEsUUFBUSx1QkFBUjtBQWpERSxDQUFkOztBQW9EQSxNQUFNQyw0QkFBVTtBQUNyQixpQkFBZUQsUUFBUSx1QkFBUixDQURNOztBQUdyQixZQUFVQSxRQUFRLGtCQUFSLENBSFc7QUFJckIsY0FBWUEsUUFBUSxvQkFBUixDQUpTOztBQU1yQjtBQUNBLGFBQVdBLFFBQVEsbUJBQVIsQ0FQVTs7QUFTckI7QUFDQSxXQUFTQSxRQUFRLGlCQUFSLENBVlk7QUFXckIsa0JBQWdCQSxRQUFRLHdCQUFSLENBWEs7QUFZckIsY0FBWUEsUUFBUSxvQkFBUixDQVpTO0FBYXJCLGdCQUFjQSxRQUFRLHNCQUFSO0FBYk8sQ0FBaEIiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgcnVsZXMgPSB7XHJcbiAgJ25vLXVucmVzb2x2ZWQnOiByZXF1aXJlKCcuL3J1bGVzL25vLXVucmVzb2x2ZWQnKSxcclxuICAnbmFtZWQnOiByZXF1aXJlKCcuL3J1bGVzL25hbWVkJyksXHJcbiAgJ2RlZmF1bHQnOiByZXF1aXJlKCcuL3J1bGVzL2RlZmF1bHQnKSxcclxuICAnbmFtZXNwYWNlJzogcmVxdWlyZSgnLi9ydWxlcy9uYW1lc3BhY2UnKSxcclxuICAnbm8tbmFtZXNwYWNlJzogcmVxdWlyZSgnLi9ydWxlcy9uby1uYW1lc3BhY2UnKSxcclxuICAnZXhwb3J0JzogcmVxdWlyZSgnLi9ydWxlcy9leHBvcnQnKSxcclxuICAnbm8tbXV0YWJsZS1leHBvcnRzJzogcmVxdWlyZSgnLi9ydWxlcy9uby1tdXRhYmxlLWV4cG9ydHMnKSxcclxuICAnZXh0ZW5zaW9ucyc6IHJlcXVpcmUoJy4vcnVsZXMvZXh0ZW5zaW9ucycpLFxyXG4gICduby1yZXN0cmljdGVkLXBhdGhzJzogcmVxdWlyZSgnLi9ydWxlcy9uby1yZXN0cmljdGVkLXBhdGhzJyksXHJcbiAgJ25vLWludGVybmFsLW1vZHVsZXMnOiByZXF1aXJlKCcuL3J1bGVzL25vLWludGVybmFsLW1vZHVsZXMnKSxcclxuICAnZ3JvdXAtZXhwb3J0cyc6IHJlcXVpcmUoJy4vcnVsZXMvZ3JvdXAtZXhwb3J0cycpLFxyXG4gICduby1yZWxhdGl2ZS1wYXJlbnQtaW1wb3J0cyc6IHJlcXVpcmUoJy4vcnVsZXMvbm8tcmVsYXRpdmUtcGFyZW50LWltcG9ydHMnKSxcclxuXHJcbiAgJ25vLXNlbGYtaW1wb3J0JzogcmVxdWlyZSgnLi9ydWxlcy9uby1zZWxmLWltcG9ydCcpLFxyXG4gICduby1jeWNsZSc6IHJlcXVpcmUoJy4vcnVsZXMvbm8tY3ljbGUnKSxcclxuICAnbm8tbmFtZWQtZGVmYXVsdCc6IHJlcXVpcmUoJy4vcnVsZXMvbm8tbmFtZWQtZGVmYXVsdCcpLFxyXG4gICduby1uYW1lZC1hcy1kZWZhdWx0JzogcmVxdWlyZSgnLi9ydWxlcy9uby1uYW1lZC1hcy1kZWZhdWx0JyksXHJcbiAgJ25vLW5hbWVkLWFzLWRlZmF1bHQtbWVtYmVyJzogcmVxdWlyZSgnLi9ydWxlcy9uby1uYW1lZC1hcy1kZWZhdWx0LW1lbWJlcicpLFxyXG4gICduby1hbm9ueW1vdXMtZGVmYXVsdC1leHBvcnQnOiByZXF1aXJlKCcuL3J1bGVzL25vLWFub255bW91cy1kZWZhdWx0LWV4cG9ydCcpLFxyXG4gICduby11bnVzZWQtbW9kdWxlcyc6IHJlcXVpcmUoJy4vcnVsZXMvbm8tdW51c2VkLW1vZHVsZXMnKSxcclxuXHJcbiAgJ25vLWNvbW1vbmpzJzogcmVxdWlyZSgnLi9ydWxlcy9uby1jb21tb25qcycpLFxyXG4gICduby1hbWQnOiByZXF1aXJlKCcuL3J1bGVzL25vLWFtZCcpLFxyXG4gICduby1kdXBsaWNhdGVzJzogcmVxdWlyZSgnLi9ydWxlcy9uby1kdXBsaWNhdGVzJyksXHJcbiAgJ2ZpcnN0JzogcmVxdWlyZSgnLi9ydWxlcy9maXJzdCcpLFxyXG4gICdtYXgtZGVwZW5kZW5jaWVzJzogcmVxdWlyZSgnLi9ydWxlcy9tYXgtZGVwZW5kZW5jaWVzJyksXHJcbiAgJ25vLWV4dHJhbmVvdXMtZGVwZW5kZW5jaWVzJzogcmVxdWlyZSgnLi9ydWxlcy9uby1leHRyYW5lb3VzLWRlcGVuZGVuY2llcycpLFxyXG4gICduby1hYnNvbHV0ZS1wYXRoJzogcmVxdWlyZSgnLi9ydWxlcy9uby1hYnNvbHV0ZS1wYXRoJyksXHJcbiAgJ25vLW5vZGVqcy1tb2R1bGVzJzogcmVxdWlyZSgnLi9ydWxlcy9uby1ub2RlanMtbW9kdWxlcycpLFxyXG4gICduby13ZWJwYWNrLWxvYWRlci1zeW50YXgnOiByZXF1aXJlKCcuL3J1bGVzL25vLXdlYnBhY2stbG9hZGVyLXN5bnRheCcpLFxyXG4gICdvcmRlcic6IHJlcXVpcmUoJy4vcnVsZXMvb3JkZXInKSxcclxuICAnbmV3bGluZS1hZnRlci1pbXBvcnQnOiByZXF1aXJlKCcuL3J1bGVzL25ld2xpbmUtYWZ0ZXItaW1wb3J0JyksXHJcbiAgJ3ByZWZlci1kZWZhdWx0LWV4cG9ydCc6IHJlcXVpcmUoJy4vcnVsZXMvcHJlZmVyLWRlZmF1bHQtZXhwb3J0JyksXHJcbiAgJ25vLWRlZmF1bHQtZXhwb3J0JzogcmVxdWlyZSgnLi9ydWxlcy9uby1kZWZhdWx0LWV4cG9ydCcpLFxyXG4gICduby1uYW1lZC1leHBvcnQnOiByZXF1aXJlKCcuL3J1bGVzL25vLW5hbWVkLWV4cG9ydCcpLFxyXG4gICduby1keW5hbWljLXJlcXVpcmUnOiByZXF1aXJlKCcuL3J1bGVzL25vLWR5bmFtaWMtcmVxdWlyZScpLFxyXG4gICd1bmFtYmlndW91cyc6IHJlcXVpcmUoJy4vcnVsZXMvdW5hbWJpZ3VvdXMnKSxcclxuICAnbm8tdW5hc3NpZ25lZC1pbXBvcnQnOiByZXF1aXJlKCcuL3J1bGVzL25vLXVuYXNzaWduZWQtaW1wb3J0JyksXHJcbiAgJ25vLXVzZWxlc3MtcGF0aC1zZWdtZW50cyc6IHJlcXVpcmUoJy4vcnVsZXMvbm8tdXNlbGVzcy1wYXRoLXNlZ21lbnRzJyksXHJcbiAgJ2R5bmFtaWMtaW1wb3J0LWNodW5rbmFtZSc6IHJlcXVpcmUoJy4vcnVsZXMvZHluYW1pYy1pbXBvcnQtY2h1bmtuYW1lJyksXHJcblxyXG4gIC8vIGV4cG9ydFxyXG4gICdleHBvcnRzLWxhc3QnOiByZXF1aXJlKCcuL3J1bGVzL2V4cG9ydHMtbGFzdCcpLFxyXG5cclxuICAvLyBtZXRhZGF0YS1iYXNlZFxyXG4gICduby1kZXByZWNhdGVkJzogcmVxdWlyZSgnLi9ydWxlcy9uby1kZXByZWNhdGVkJyksXHJcblxyXG4gIC8vIGRlcHJlY2F0ZWQgYWxpYXNlcyB0byBydWxlc1xyXG4gICdpbXBvcnRzLWZpcnN0JzogcmVxdWlyZSgnLi9ydWxlcy9pbXBvcnRzLWZpcnN0JyksXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBjb25maWdzID0ge1xyXG4gICdyZWNvbW1lbmRlZCc6IHJlcXVpcmUoJy4uL2NvbmZpZy9yZWNvbW1lbmRlZCcpLFxyXG5cclxuICAnZXJyb3JzJzogcmVxdWlyZSgnLi4vY29uZmlnL2Vycm9ycycpLFxyXG4gICd3YXJuaW5ncyc6IHJlcXVpcmUoJy4uL2NvbmZpZy93YXJuaW5ncycpLFxyXG5cclxuICAvLyBzaGhoaC4uLiB3b3JrIGluIHByb2dyZXNzIFwic2VjcmV0XCIgcnVsZXNcclxuICAnc3RhZ2UtMCc6IHJlcXVpcmUoJy4uL2NvbmZpZy9zdGFnZS0wJyksXHJcblxyXG4gIC8vIHVzZWZ1bCBzdHVmZiBmb3IgZm9sa3MgdXNpbmcgdmFyaW91cyBlbnZpcm9ubWVudHNcclxuICAncmVhY3QnOiByZXF1aXJlKCcuLi9jb25maWcvcmVhY3QnKSxcclxuICAncmVhY3QtbmF0aXZlJzogcmVxdWlyZSgnLi4vY29uZmlnL3JlYWN0LW5hdGl2ZScpLFxyXG4gICdlbGVjdHJvbic6IHJlcXVpcmUoJy4uL2NvbmZpZy9lbGVjdHJvbicpLFxyXG4gICd0eXBlc2NyaXB0JzogcmVxdWlyZSgnLi4vY29uZmlnL3R5cGVzY3JpcHQnKSxcclxufVxyXG4iXX0=