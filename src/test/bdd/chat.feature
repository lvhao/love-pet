Feature: 聊天消息
  作为宠主或护理师，我想在订单中发送和查看消息，以便沟通服务细节。

  Scenario: 加载空聊天记录
    Given 订单 "order-1" 没有聊天记录
    When 我加载该订单的聊天记录
    Then 返回空数组

  Scenario: 发送文本消息
    Given 订单 "order-2" 没有聊天记录
    When 我发送一条文本消息 "你好，请问猫咪情况如何？"
    Then 消息被保存到 localStorage
    And 消息包含发送者、文本和时间戳

  Scenario: 发送带图片的消息
    Given 订单 "order-3" 没有聊天记录
    When 我发送一条带图片的消息
    Then 消息包含图片字段

  Scenario: 多条消息按顺序保存
    Given 订单 "order-4" 没有聊天记录
    When 我发送 3 条消息
    Then 聊天记录包含 3 条消息

  Scenario: 清除聊天记录
    Given 订单 "order-5" 有聊天记录
    When 我清除该订单的聊天记录
    Then 该订单的聊天记录为空
