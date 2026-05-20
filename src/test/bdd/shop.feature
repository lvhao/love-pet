Feature: 商城浏览与搜索
  作为宠主，我想浏览和搜索商品，以便找到需要的宠物用品。

  Background:
    Given 我在商城页面

  Scenario: 查看商城标题
    Then 我看到"宠管家商城"标题

  Scenario: 查看搜索框
    Then 我看到搜索框提示"搜索猫粮、狗粮、玩具..."

  Scenario: 查看商品分类标签
    Then 我看到"全部"分类
    And 我看到"猫粮"分类
    And 我看到"狗粮"分类

  Scenario: 商品加载后显示
    When 商品加载完成
    Then 我看到"皇家猫粮 室内成猫粮 2kg"

  Scenario: 按分类筛选商品
    When 商品加载完成
    And 我点击"猫粮"分类
    Then 我看到猫粮商品
