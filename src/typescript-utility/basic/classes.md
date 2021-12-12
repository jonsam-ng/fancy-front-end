# classes 类类型

<TimeToRead />

## 目录

[[TOC]]

## Class Members 类成员

### --strictPropertyInitialization

The strictPropertyInitialization setting controls whether class fields need to be initialized in the constructor.
strictPropertyInitialization 设置控制是否需要在构造函数中初始化类字段。

If you intend to definitely initialize a field through means other than the constructor (for example, maybe an external library is filling in part of your class for you), you can use the definite assignment assertion operator, !:
如果您打算通过构造函数以外的方法(例如，可能有一个外部库为您填充了类的一部分)确切地初始化字段，那么您可以使用确定的赋值断言运算符，！

## readonly

Fields may be prefixed with the readonly modifier. This prevents assignments to the field outside of the constructor.
字段可以用 readonly 修饰符作为前缀。这样可以防止赋值到构造函数之外的字段。

## Constructors 构造器

Class constructors are very similar to functions. You can add parameters with type annotations, default values, and overloads.
类构造函数与函数非常相似。你可以添加带有类型注释、默认值和重载的参数。

There are just a few differences between class constructor signatures and function signatures:
类构造函数签名和函数签名只有一些区别:

- Constructors can’t have type parameters - these belong on the outer class declaration.
构造函数不能有类型参数——它们属于外部类声明。
- onstructors can’t have return type annotations - the class instance type is always what’s returned
构造函数不能有返回类型注释——返回的总是类实例类型。

## Super Calls 父级构造器调用

## Methods 方法

## Getters / Setters

TypeScript has some special inference rules for accessors:
对访问器有一些特殊的推理规则:

- If get exists but no set, the property is automatically readonly.
如果 get 存在但没有设置，则属性自动为只读
- If the type of the setter parameter is not specified, it is inferred from the return type of the getter.
如果没有指定 setter 参数的类型，则从 getter 的返回类型推断出来
- Getters and setters must have the same Member Visibility.
Getters 和 setter 必须具有相同的成员 Visibility

## Index Signatures 索引签名

```ts
class MyClass {
  [s: string]: boolean | ((s: string) => boolean);
 
  check(s: string) {
    return this[s] as boolean;
  }
}
```

## Class Heritage 类继承

- implements： Classes may also implement multiple interfaces, e.g. class C implements A, B {}.
