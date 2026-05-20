Feature: 照护师接单
  作为照护师，我想接单并完成服务，以便获得收入。

  Scenario: 接单
    Given 有一个新订单
    When 我点击"接单"按钮
    Then 订单状态变为"已接单"
    And 我看到客户信息

  Scenario: 开始服务
    Given 我有一个"已接单"的订单
    When 我到达服务地点
    And 我点击"开始服务"
    Then 订单状态变为"服务中"
    And 开始计时

  Scenario: 提交服务报告
    Given 我完成了服务
    When 我上传服务照片
    And 我填写服务说明
    And 我提交报告
    Then 订单状态变为"待确认"
