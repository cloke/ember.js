import { setOwner } from '@ember/-internals/owner';
import { get, inject } from '..';
import { moduleFor, AbstractTestCase } from 'internal-test-helpers';

moduleFor(
  'inject',
  class extends AbstractTestCase {
    ['@test injected properties should be descriptors'](assert) {
      assert.ok(typeof inject('type') === 'function');
    }

    ['@test injected properties should be overridable'](assert) {
      class TestClass {
        @inject('type') foo;
      }

      let obj = new TestClass();
      obj.foo = 'bar';

      assert.equal(obj.foo, 'bar', 'should return the overridden value');
    }

    ['@test getting on an object without an owner or container should fail assertion']() {
      class TestClass {
        @inject('type', 'name') foo;
      }

      let obj = new TestClass();

      expectAssertion(function () {
        get(obj, 'foo');
      }, /Attempting to lookup an injected property on an object without a container, ensure that the object was instantiated via a container./);
    }

    ['@test getting on an object without an owner but with a container should not fail'](assert) {
      class TestClass {
        @inject('type', 'name') foo;
      }

      let obj = new TestClass();
      obj.container = {
        lookup(key) {
          assert.ok(true, 'should call container.lookup');
          return key;
        },
      };

      assert.equal(get(obj, 'foo'), 'type:name', 'should return the value of container.lookup');
    }

    ['@test getting should return a lookup on the container'](assert) {
      assert.expect(2);

      class TestClass {
        @inject('type', 'name') foo;
      }

      let obj = new TestClass();

      setOwner(obj, {
        lookup(key) {
          assert.ok(true, 'should call container.lookup');
          return key;
        },
      });

      assert.equal(get(obj, 'foo'), 'type:name', 'should return the value of container.lookup');
    }

    ['@test omitting the lookup name should default to the property name'](assert) {
      class TestClass {
        @inject('type') foo;
      }

      let obj = new TestClass();

      setOwner(obj, {
        lookup(key) {
          return key;
        },
      });

      assert.equal(get(obj, 'foo'), 'type:foo', 'should lookup the type using the property name');
    }
  }
);
