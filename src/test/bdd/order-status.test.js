import { expect } from 'vitest'
import { given, bddThen as then, runFeature } from './bdd'
import { isValidTransition, VALID_TRANSITIONS } from '../../data/store'

given('订单状态为"pending"', () => {})
given('订单状态为"accepted"', () => {})
given('订单状态为"in_progress"', () => {})
given('订单状态为"streaming"', () => {})
given('订单状态为"completed"', () => {})
given('订单状态为"cancelled"', () => {})

then('pending 可以流转到 accepted', () => {
  expect(isValidTransition('pending', 'accepted')).toBe(true)
})
then('pending 可以流转到 cancelled', () => {
  expect(isValidTransition('pending', 'cancelled')).toBe(true)
})
then('pending 不能流转到 in_progress', () => {
  expect(isValidTransition('pending', 'in_progress')).toBe(false)
})
then('accepted 可以流转到 in_progress', () => {
  expect(isValidTransition('accepted', 'in_progress')).toBe(true)
})
then('accepted 可以流转到 cancelled', () => {
  expect(isValidTransition('accepted', 'cancelled')).toBe(true)
})
then('in_progress 可以流转到 streaming', () => {
  expect(isValidTransition('in_progress', 'streaming')).toBe(true)
})
then('in_progress 可以流转到 completed', () => {
  expect(isValidTransition('in_progress', 'completed')).toBe(true)
})
then('in_progress 可以流转到 cancelled', () => {
  expect(isValidTransition('in_progress', 'cancelled')).toBe(true)
})
then('streaming 可以流转到 completed', () => {
  expect(isValidTransition('streaming', 'completed')).toBe(true)
})
then('streaming 可以流转到 cancelled', () => {
  expect(isValidTransition('streaming', 'cancelled')).toBe(true)
})
then('completed 是终态', () => {
  expect(VALID_TRANSITIONS.completed || []).toEqual([])
})
then('cancelled 是终态', () => {
  expect(VALID_TRANSITIONS.cancelled || []).toEqual([])
})

runFeature(`
Feature: 订单状态流转
  作为系统，订单需要按照规定的状态机流转，不允许非法状态跳转。

  Scenario: 待接单订单可以接单
    Given 订单状态为"pending"
    Then pending 可以流转到 accepted

  Scenario: 待接单订单可以取消
    Given 订单状态为"pending"
    Then pending 可以流转到 cancelled

  Scenario: 待接单订单不能直接开始服务
    Given 订单状态为"pending"
    Then pending 不能流转到 in_progress

  Scenario: 已接单订单可以开始服务
    Given 订单状态为"accepted"
    Then accepted 可以流转到 in_progress

  Scenario: 已接单订单可以取消
    Given 订单状态为"accepted"
    Then accepted 可以流转到 cancelled

  Scenario: 服务中订单可以开始直播
    Given 订单状态为"in_progress"
    Then in_progress 可以流转到 streaming

  Scenario: 服务中订单可以完成
    Given 订单状态为"in_progress"
    Then in_progress 可以流转到 completed

  Scenario: 服务中订单可以取消
    Given 订单状态为"in_progress"
    Then in_progress 可以流转到 cancelled

  Scenario: 直播中订单可以完成
    Given 订单状态为"streaming"
    Then streaming 可以流转到 completed

  Scenario: 直播中订单可以取消
    Given 订单状态为"streaming"
    Then streaming 可以流转到 cancelled

  Scenario: 已完成订单不能流转
    Given 订单状态为"completed"
    Then completed 是终态

  Scenario: 已取消订单不能流转
    Given 订单状态为"cancelled"
    Then cancelled 是终态
`)
