# frozen_string_literal: true

require "smart_sdu"

module SduSmart
  autoload :Quantity, "#{__dir__}/sdu_smart/quantity"
  autoload :Unit, "#{__dir__}/sdu_smart/unit"
  autoload :MathConcept, "#{__dir__}/sdu_smart/math_concept"
  autoload :VERSION, "#{__dir__}/sdu_smart/version"
end
