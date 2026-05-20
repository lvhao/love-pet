Feature: 购物车管理
  作为宠主，我想管理购物车中的商品，以便在结算前调整购买内容。

  Background:
    Given 我在商城页面

  Scenario: 添加商品到购物车
    When 我点击商品的加购按钮
    Then 购物车图标显示数量为 1

  Scenario: 添加同一商品多次
    When 我点击同一商品的加购按钮 2 次
    Then 购物车图标显示数量为 2

  Scenario: 购物车为空时显示空状态
    Given 我进入购物车页面
    Then 我看到空状态提示"购物车是空的"
    And 我看到"去逛逛"按钮

  Scenario: 从购物车删除商品
    Given 购物车中有 1 件商品
    When 我删除该商品
    Then 购物车为空

  Scenario: 修改商品数量
    Given 购物车中有 1 件商品
    When 我将数量改为 3
    Then 商品数量显示为 3
    And 小计价格更新

  Scenario: 选择配送方式为上门配送
    Given 购物车中有商品
    When 我选择"上门配送"
    Then 运费为 0

  Scenario: 选择配送方式为快递邮寄且金额不足99元
    Given 购物车中有商品总价低于 99 元
    When 我选择"快递邮寄"
    Then 运费为 8 元

  Scenario: 选择配送方式为快递邮寄且金额满99元
    Given 购物车中有商品总价不低于 99 元
    When 我选择"快递邮寄"
    Then 运费为 0
