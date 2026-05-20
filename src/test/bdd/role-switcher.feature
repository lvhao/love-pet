Feature: 角色切换
  作为用户，我想在不同角色之间切换，以便使用不同角色的功能。

  Scenario: 查看三个角色选项
    Given 我在任意页面
    Then 我看到"宠主"角色选项
    And 我看到"护理师"角色选项
    And 我看到"运营"角色选项

  Scenario: 点击其他角色直接切换
    Given 我当前角色是"宠主"
    When 我点击"护理师"角色选项
    Then 我看不到确认对话框
    And 我切换到"护理师"角色

  Scenario: 点击当前角色不弹出对话框
    Given 我当前角色是"宠主"
    When 我点击"宠主"角色选项
    Then 我看不到确认对话框

  Scenario: 切换后不出现确认控件
    Given 我当前角色是"宠主"
    When 我点击"护理师"角色选项
    Then 我看不到确认对话框
