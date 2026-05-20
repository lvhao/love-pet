Feature: 宠物管理
  作为宠主，我想管理我的宠物信息，以便预约服务时使用。

  Scenario: 添加新宠物
    Given 我在宠物列表页面
    When 我点击"添加宠物"按钮
    And 我填写宠物信息
    Then 宠物列表中显示新添加的宠物

  Scenario: 编辑宠物信息
    Given 我有一只名为"旺财"的宠物
    When 我点击编辑按钮
    And 我修改宠物名称为"小白"
    Then 宠物名称更新为"小白"

  Scenario: 删除宠物
    Given 我有一只宠物
    When 我点击删除按钮
    And 我确认删除
    Then 宠物从列表中移除
