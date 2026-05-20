Feature: 订单状态流转
  作为系统，订单需要按照规定的状态机流转，不允许非法状态跳转。

  Scenario: 待接单订单可以接单
    Given 订单状态为"pending"
    Then 可以流转到"accepted"

  Scenario: 待接单订单可以取消
    Given 订单状态为"pending"
    Then 可以流转到"cancelled"

  Scenario: 待接单订单不能直接开始服务
    Given 订单状态为"pending"
    Then 不能流转到"in_progress"

  Scenario: 已接单订单可以开始服务
    Given 订单状态为"accepted"
    Then 可以流转到"in_progress"

  Scenario: 已接单订单可以取消
    Given 订单状态为"accepted"
    Then 可以流转到"cancelled"

  Scenario: 服务中订单可以开始直播
    Given 订单状态为"in_progress"
    Then 可以流转到"streaming"

  Scenario: 服务中订单可以完成
    Given 订单状态为"in_progress"
    Then 可以流转到"completed"

  Scenario: 服务中订单可以取消
    Given 订单状态为"in_progress"
    Then 可以流转到"cancelled"

  Scenario: 直播中订单可以完成
    Given 订单状态为"streaming"
    Then 可以流转到"completed"

  Scenario: 直播中订单可以取消
    Given 订单状态为"streaming"
    Then 可以流转到"cancelled"

  Scenario: 已完成订单不能流转
    Given 订单状态为"completed"
    Then 不能流转到任何状态

  Scenario: 已取消订单不能流转
    Given 订单状态为"cancelled"
    Then 不能流转到任何状态
