//  @flow
export default class Router {
  routeList = {};
  addRoute(pattern: string, handler: mixed) {
    let splittedPattern = pattern.split('/');
    let base = splittedPattern[1];
    let placeholderr;

    if (splittedPattern[2] === undefined) {
      placeholderr = null;
    } else {
      placeholderr = splittedPattern[2];
    }

    this.routeList[base] = [placeholderr, handler];
    console.log('route available', this.routeList);
  }

  handleRequest(path: string, context: Object) {
    console.log('request received', path);

    let splittedPath = path.split('/');
    let base = splittedPath[1];
    let placeholderr = splittedPath[2];
    console.log('splittedPath', splittedPath);
    let handler;
    if (this.routeList.hasOwnProperty(base)) {
      handler = this.routeList[base][1];
      if (!placeholderr) {
        handler(context);
      } else {
        handler(context, placeholderr);
      }
    } else {
      handler = this.routeList['notFound'][1];
      console.log('tetot!');
      handler(context);
    }
  }
}
