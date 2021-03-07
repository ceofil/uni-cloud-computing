function build_url_regex(url_template: string): RegExp {
  if (url_template.endsWith("/")) {
    url_template += "?";
  } else {
    url_template += "/?";
  }
  url_template = url_template.split("/:id").join("/(\\d+)");
  return new RegExp(`^${url_template}$`);
}
let a = build_url_regex("/a/:id");
let b = build_url_regex("/b/:id/a/:id");

function test(str: string, re: RegExp): boolean {
  return str.match(re) !== null;
}

const a_bad = ["/a", "/a/af", "/a/211/134", "/a/1/b"];
const b_bad = ["/b", "/b/adsf/a/afd", "b/123/123/a/", "b/124/a/1245/afd"];

const a_good = ["/a/124", "/a/1", "/a/0/", "/a/9151"];
const b_good = ["/b/124/a/14114/", "/b/1/a/1673", "/b/0/a/153/", "/b/9151/a/1"];

function test_list(list: string[], re: RegExp, expected: boolean): boolean {
  let passed = true;
  for (let str of list) {
    if (test(str, re) !== expected) {
      passed = false;
      console.log(`${re} EVALUATED ${str} as ${!expected}`);
      break;
    }
  }
  return passed;
}

test_list(a_bad, a, false);
test_list(b_bad, b, false);
test_list(a_good, a, true);
test_list(b_good, b, true);
