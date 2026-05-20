Feature: 服务预约
  作为宠主，我想预约宠物服务，以便照护师上门服务。

  Scenario: 预约洗澡服务
    Given 我选择了一只宠物
    When 我选择"洗澡"服务
    And 我选择服务时间
    And 我填写地址信息
    And 我提交订单
    Then 订单创建成功
    And 我看到订单详情

  Scenario: 查看服务订单列表
    Given 我有 3 个服务订单
    When 我进入订单页面
    Then 我看到 3 个订单
    And 订单按时间倒序排列

  Scenario: 取消待接单的订单
    Given 我有一个"待接单"状态的订单
    When 我点击取消订单
    And 我确认取消
    Then 订单状态变为"已取消"
