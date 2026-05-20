Feature: 实时监控
  作为宠主，我想实时查看宠物服务过程，以便了解服务情况。

  Scenario: 查看服务直播
    Given 照护师正在服务中
    When 我进入实时监控页面
    Then 我看到视频画面
    And 我看到服务进度

  Scenario: 直播聊天互动
    Given 我在观看直播
    When 我发送消息"辛苦了"
    Then 消息显示在聊天区域
    And 照护师可以看到我的消息
