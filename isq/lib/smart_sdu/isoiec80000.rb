# frozen_string_literal: true

module SmartSdu
  module IsoIec80000
    autoload :Quantity, "#{__dir__}/isoiec80000/quantity"
    autoload :Unit, "#{__dir__}/isoiec80000/unit"
    autoload :MathConcept, "#{__dir__}/isoiec80000/math_concept"
  end
end
